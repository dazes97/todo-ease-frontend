export interface IRequest<T> {
    code:    string;
    message: string;
    body:    T;
}
