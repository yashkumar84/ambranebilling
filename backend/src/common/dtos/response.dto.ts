export class ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    timestamp: string

    constructor(success: boolean, data?: T, error?: string, message?: string) {
        this.success = success
        this.data = data
        this.error = error
        this.message = message
        this.timestamp = new Date().toISOString()
    }

    static success<T>(data: T, message?: string) {
        // Return plain object instead of class instance for proper serialization
        return {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        }
    }

    static error(error: string, message?: string): ApiResponse {
        return new ApiResponse(false, undefined, error, message)
    }
}
