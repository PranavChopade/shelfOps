class ApiResponse {
  constructor(data, message = 'success') {
    this.success = true;
    this.data = data;
    this.message = message;
  }
}
export default ApiResponse;
