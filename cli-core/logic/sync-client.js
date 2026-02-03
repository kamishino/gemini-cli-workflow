const https = require("https");
const http = require("http");
const { URL } = require("url");
const logger = require("../utils/logger");

/**
 * SyncClient - HTTP client for KamiFlow sync backend
 * Handles API requests with authentication
 */
class SyncClient {
  constructor(backendUrl, apiKey) {
    this.backendUrl = backendUrl;
    this.apiKey = apiKey;
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Test connection to backend
   * @returns {Promise<{status: string, version: string}>}
   */
  async testConnection() {
    const response = await this.request("GET", "/health");
    return response;
  }

  /**
   * Push files to backend
   * @param {string} projectId
   * @param {Array<{path: string, checksum: string, modified: number, size: number, content: string}>} files
   * @param {Array<string>} deletions
   * @returns {Promise<{synced: number, deleted: number, conflicts: Array}>}
   */
  async pushFiles(projectId, files, deletions = []) {
    const response = await this.request("POST", `/v1/projects/${projectId}/sync`, {
      files: files.map(f => ({
        path: f.path,
        checksum: f.checksum,
        modified: f.modified,
        size: f.size,
        content: Buffer.from(f.content).toString("base64")
      })),
      deletions
    });
    return response;
  }

  /**
   * Pull files from backend
   * @param {string} projectId
   * @param {number} sinceTimestamp
   * @returns {Promise<{files: Array, hasMore: boolean}>}
   */
  async pullFiles(projectId, sinceTimestamp = 0) {
    const response = await this.request(
      "GET",
      `/v1/projects/${projectId}/files?since=${sinceTimestamp}`
    );
    
    // Decode base64 content
    if (response.files) {
      response.files = response.files.map(f => ({
        ...f,
        content: Buffer.from(f.content || "", "base64").toString("utf8")
      }));
    }
    
    return response;
  }

  /**
   * Get sync status for project
   * @param {string} projectId
   * @returns {Promise<{lastSync: number, fileCount: number}>}
   */
  async getProjectStatus(projectId) {
    const response = await this.request("GET", `/v1/projects/${projectId}/status`);
    return response;
  }

  /**
   * Delete all remote data for project
   * @param {string} projectId
   * @returns {Promise<{deleted: number}>}
   */
  async deleteProject(projectId) {
    const response = await this.request("DELETE", `/v1/projects/${projectId}`);
    return response;
  }

  /**
   * Generic HTTP request handler
   * @param {string} method
   * @param {string} path
   * @param {Object} body
   * @returns {Promise<any>}
   */
  async request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.backendUrl);
      const isHttps = url.protocol === "https:";
      const lib = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "KamiFlow-Sync/1.0",
        },
        timeout: this.timeout
      };

      // Add authentication
      if (this.apiKey) {
        options.headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      // Add body
      let postData = null;
      if (body) {
        postData = JSON.stringify(body);
        options.headers["Content-Length"] = Buffer.byteLength(postData);
      }

      const req = lib.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              const error = new Error(parsed.error || `HTTP ${res.statusCode}`);
              error.statusCode = res.statusCode;
              error.response = parsed;
              reject(error);
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ data });
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Connection failed: ${error.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }
}

module.exports = { SyncClient };
