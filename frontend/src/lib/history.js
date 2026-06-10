const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches all past analysis records (summaries, excluding large file blobs)
 * @returns {Promise<Array>}
 */
export async function getHistory() {
  const response = await fetch(`${API_BASE_URL}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetches details of a single analysis entry (includes file blobs and full texts)
 * @param {string} id Record identifier
 * @returns {Promise<Object>}
 */
export async function getHistoryEntry(id) {
  const response = await fetch(`${API_BASE_URL}/history/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history entry: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Saves a new analysis entry to the database
 * @param {Object} entry The analysis record details
 * @returns {Promise<Object>}
 */
export async function saveHistoryEntry(entry) {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(entry)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to save analysis: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Deletes a single analysis record from the database
 * @param {string} id Record identifier
 * @returns {Promise<Object>}
 */
export async function deleteHistoryEntry(id) {
  const response = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to delete record: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Deletes all analysis records from the database
 * @returns {Promise<Object>}
 */
export async function clearAllHistory() {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`Failed to clear history: ${response.statusText}`);
  }
  return await response.json();
}
