import ReactNativeBlobUtil from 'react-native-blob-util';
import {API_BASE_URL} from '../constants/api';

const buildUrl = path => `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

const LOG_PREFIX = '[API]';

function logRequest(apiName, url, method, body, options = {}) {
  const safeBody = options.maskKeys
    ? Object.fromEntries(
        Object.entries(body).map(([k, v]) =>
          options.maskKeys.includes(k) ? [k, '***'] : [k, v],
        ),
      )
    : body;
  console.log(`${LOG_PREFIX} REQUEST ${apiName}`, {
    url,
    method,
    body: safeBody,
  });
}

function logResponse(apiName, status, data, ok) {
  console.log(`${LOG_PREFIX} RESPONSE ${apiName}`, {
    status,
    ok,
    data,
  });
}

/**
 * Login – user/login
 * @param {{ username: string, password: string }} params
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 */
export async function login({username, password}) {
  const apiName = 'user/login';
  const url = buildUrl(apiName);
  const body = {username, password};

  logRequest(apiName, url, 'POST', body, {maskKeys: ['password']});

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams(body).toString(),
    });
    const data = await response.json().catch(() => ({}));
    logResponse(apiName, response.status, data, response.ok);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Login failed (${response.status})`,
      };
    }
    return {success: true, data};
  } catch (e) {
    console.log(`${LOG_PREFIX} ERROR ${apiName}`, e.message);
    return {
      success: false,
      message: e.message || 'Network error. Please try again.',
    };
  }
}

/**
 * Get invoice details – user/getinvoicedetails
 * @param {{ invoice_number: string }} params
 * @param {{ token?: string }} options - optional auth token
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 */
export async function getInvoiceDetails({invoice_number}, options = {}) {
  const apiName = 'user/getinvoicedetails';
  const url = buildUrl(apiName);
  const body = {invoice_number};

  logRequest(apiName, url, 'POST', body);

  try {
    const headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: new URLSearchParams(body).toString(),
    });
    const data = await response.json().catch(() => ({}));
    logResponse(apiName, response.status, data, response.ok);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Request failed (${response.status})`,
      };
    }
    return {success: true, data};
  } catch (e) {
    console.log(`${LOG_PREFIX} ERROR ${apiName}`, e.message);
    return {
      success: false,
      message: e.message || 'Network error. Please try again.',
    };
  }
}

/**
 * Agreement preview – user/agreement_preview
 * @param {{ invoice_number: string }} params
 * @param {{ token?: string }} options
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 */
export async function getAgreementPreview({invoice_number}, options = {}) {
  const apiName = 'user/agreement_preview';
  const url = buildUrl(apiName);
  const body = {invoice_number};

  logRequest(apiName, url, 'POST', body);

  try {
    const headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: new URLSearchParams(body).toString(),
    });
    const data = await response.json().catch(() => ({}));
    logResponse(apiName, response.status, data, response.ok);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Request failed (${response.status})`,
      };
    }
    return {success: true, data: data.data ?? data};
  } catch (e) {
    console.log(`${LOG_PREFIX} ERROR ${apiName}`, e.message);
    return {
      success: false,
      message: e.message || 'Network error. Please try again.',
    };
  }
}

/**
 * Agreement sign – user/agreement_sign
 * Sends signature as a proper PNG image file (binary), not base64.
 * @param {{ invoice_number: string, signature_image: string }} params - signature_image is data URL (data:image/jpeg;base64,...) from the canvas
 * @param {{ token?: string }} options
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 */
export async function agreementSign({invoice_number, signature_image}, options = {}) {
  const apiName = 'user/agreement_sign';
  const url = buildUrl(apiName);

  const base64 =
    typeof signature_image === 'string' && signature_image.startsWith('data:')
      ? signature_image.replace(/^data:image\/\w+;base64,/, '')
      : (signature_image || '');

  const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/signature_${Date.now()}.jpg`;
  await ReactNativeBlobUtil.fs.createFile(tempPath, base64, 'base64');
  const fileUri = tempPath.startsWith('file://') ? tempPath : `file://${tempPath}`;

  const formData = new FormData();
  formData.append('invoice_number', invoice_number);
  formData.append('signature_image', {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'signature.jpg',
  });

  logRequest(apiName, url, 'POST', {invoice_number, signature_image: '[file]'});

  try {
    const headers = {};
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    logResponse(apiName, response.status, data, response.ok);

    try {
      await ReactNativeBlobUtil.fs.unlink(tempPath);
    } catch (_) {}

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Request failed (${response.status})`,
      };
    }
    return {success: true, data: data.data ?? data};
  } catch (e) {
    try {
      await ReactNativeBlobUtil.fs.unlink(tempPath);
    } catch (_) {}
    console.log(`${LOG_PREFIX} ERROR ${apiName}`, e.message);
    return {
      success: false,
      message: e.message || 'Network error. Please try again.',
    };
  }
}

/**
 * Get customer documents – user/get_customer_documents
 * @param {{ customer_id: number|string }} params
 * @param {{ token?: string }} options
 * @returns {Promise<{ success: boolean, status?: boolean, data?: any, message?: string }>}
 */
export async function getCustomerDocuments({customer_id}, options = {}) {
  const apiName = 'user/get_customer_documents';
  const url = buildUrl(apiName);
  const body = {customer_id: String(customer_id)};

  logRequest(apiName, url, 'POST', body);

  try {
    const headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: new URLSearchParams(body).toString(),
    });
    const data = await response.json().catch(() => ({}));
    logResponse(apiName, response.status, data, response.ok);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Request failed (${response.status})`,
      };
    }
    return {
      success: true,
      status: data.status === true,
      data: data.data,
      message: data.message,
    };
  } catch (e) {
    console.log(`${LOG_PREFIX} ERROR ${apiName}`, e.message);
    return {
      success: false,
      message: e.message || 'Network error. Please try again.',
    };
  }
}

/**
 * Upload customer documents – user/customer_documents_upload
 * @param {{ customer_id: number|string, invoice_number: string, doc_front: { uri, type?, name? }, doc_back: { uri, type?, name? } }} params
 * @param {{ token?: string }} options
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 */
export async function customerDocumentsUpload(
  {customer_id, invoice_number, doc_front, doc_back},
  options = {},
) {
  const apiName = 'user/customer_documents_upload';
  const url = buildUrl(apiName);

  const formData = new FormData();
  formData.append('customer_id', String(customer_id));
  formData.append('invoice_number', invoice_number);
  if (doc_front?.uri) {
    formData.append('doc_front', {
      uri: doc_front.uri,
      type: doc_front.type || 'image/jpeg',
      name: doc_front.name || 'doc_front.jpg',
    });
  }
  if (doc_back?.uri) {
    formData.append('doc_back', {
      uri: doc_back.uri,
      type: doc_back.type || 'image/jpeg',
      name: doc_back.name || 'doc_back.jpg',
    });
  }

  logRequest(apiName, url, 'POST', {
    customer_id,
    invoice_number,
    doc_front: '[file]',
    doc_back: '[file]',
  });

  try {
    const headers = {};
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    logResponse(apiName, response.status, data, response.ok);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `Request failed (${response.status})`,
      };
    }
    return {success: true, data: data.data ?? data};
  } catch (e) {
    console.log(`${LOG_PREFIX} ERROR ${apiName}`, e.message);
    return {
      success: false,
      message: e.message || 'Network error. Please try again.',
    };
  }
}
