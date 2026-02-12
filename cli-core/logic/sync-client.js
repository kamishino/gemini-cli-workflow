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
   * @param {Object} metadata - Optional project metadata (name, gitRepo)
   * @returns {Promise<{synced: number, deleted: number, conflicts: Array}>}
   */
  async pushFiles(projectId, files, deletions = [], metadata = null) {
    const response = await this.request(
      "POST",
      `/v1/projects/${projectId}/sync`,
      {
        files: files.map((f) => ({
          path: f.path,
          checksum: f.checksum,
          modified: f.modified,
          size: f.size,
          content: Buffer.from(f.content).toString("base64"),
        })),
        deletions,
        metadata,
      },
    );
    return response;
  }

  /**
   * Pull files from backend with pagination
   * @param {string} projectId
   * @param {number} sinceTimestamp
   * @returns {Promise<{files: Array}>}
   */
  async pullFiles(projectId, sinceTimestamp = 0) {
    let allFiles = [];
    let hasMore = true;
    let currentSince = sinceTimestamp;

    logger.info(`Starting sync pull...`);

    while (hasMore) {
      const response = await this.request(
        "GET",
        `/v1/projects/${projectId}/files?since=${currentSince}&limit=100`,
      );

      let batch = response.files || [];

      // Decode base64 content
      batch = batch.map((f) => ({
        ...f,
        content: Buffer.from(f.content || "", "base64").toString("utf8"),
      }));

      allFiles = allFiles.concat(batch);
      hasMore = response.hasMore;

      if (batch.length > 0) {
        // Use the last file's synced_at as the cursor for the next batch
        // Fallback to max modified time if synced_at not present (legacy compat)
        const lastFile = batch[batch.length - 1];
        currentSince = lastFile.synced_at || lastFile.modified;
        logger.info(
          `  Retrieved ${batch.length} files... (Total: ${allFiles.length})`,
        );
      } else {
        hasMore = false;
      }
    }

    return { files: allFiles, hasMore: false };
  }

  /**
   * Get sync status for project
   * @param {string} projectId
   * @returns {Promise<{lastSync: number, fileCount: number}>}
   */
  async getProjectStatus(projectId) {
    const response = await this.request(
      "GET",
      `/v1/projects/${projectId}/status`,
    );
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
        timeout: this.timeout,
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
