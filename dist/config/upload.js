"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YEARBOOK_MAX_FILE_SIZE_BYTES = exports.YEARBOOK_MAX_FILE_SIZE_MB = void 0;
const DEFAULT_YEARBOOK_MAX_FILE_SIZE_MB = 20;
function parseYearbookMaxFileSizeMb() {
    const configuredMb = Number(process.env.YEARBOOK_UPLOAD_MAX_SIZE_MB);
    if (!Number.isFinite(configuredMb) || configuredMb <= 0)
        return DEFAULT_YEARBOOK_MAX_FILE_SIZE_MB;
    return configuredMb;
}
exports.YEARBOOK_MAX_FILE_SIZE_MB = parseYearbookMaxFileSizeMb();
exports.YEARBOOK_MAX_FILE_SIZE_BYTES = exports.YEARBOOK_MAX_FILE_SIZE_MB * 1024 * 1024;
//# sourceMappingURL=upload.js.map