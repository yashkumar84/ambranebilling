export class PaginationDTO {
    page: number
    limit: number
    skip: number

    constructor(page: number = 1, limit: number = 20) {
        this.page = Math.max(1, page)
        this.limit = Math.min(100, Math.max(1, limit))
        this.skip = (this.page - 1) * this.limit
    }

    getMetadata(total: number) {
        return {
            page: this.page,
            limit: this.limit,
            total,
            totalPages: Math.ceil(total / this.limit),
        }
    }
}

export interface PaginatedResponse<T> {
    items: T[]
    page: number
    limit: number
    total: number
    totalPages: number
}
