import axios, { AxiosError } from 'axios';
import { CustomerPayment, CustomerPaymentCreateData } from '@/types/customerPayment'; // Assuming UpdateData is not used for now

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const handleError = (error: AxiosError | Error, defaultMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
      const detail = (error.response.data as any).detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) return detail.map((err: any) => `${err.loc.join(' -> ')}: ${err.msg}`).join('; ');
    }
    return defaultMessage;
  }
  return error.message || defaultMessage;
};

interface GetCustomerPaymentsParams {
  skip?: number;
  limit?: number;
  branchId?: number | 'all';
  customerId?: number;
  paymentDateStart?: string; // ISO "YYYY-MM-DD"
  paymentDateEnd?: string;   // ISO "YYYY-MM-DD"
  paymentMethodAccountId?: number;
}

export const getCustomerPayments = async (token: string, params: GetCustomerPaymentsParams = {}): Promise<CustomerPayment[]> => {
  try {
    const queryParams: any = {
      skip: params.skip,
      limit: params.limit,
      customer_id: params.customerId,
      payment_date_start: params.paymentDateStart,
      payment_date_end: params.paymentDateEnd,
      payment_method_account_id: params.paymentMethodAccountId,
    };
    if (typeof params.branchId === 'number') {
      queryParams.branch_id = params.branchId;
    }
    Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

    const response = await axios.get<CustomerPayment[]>(`${API_BASE_URL}/customer-payments/`, {
      ...getAuthHeaders(token),
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch customer payments.'));
  }
};

export const getCustomerPaymentById = async (token: string, id: number): Promise<CustomerPayment> => {
  try {
    const response = await axios.get<CustomerPayment>(`${API_BASE_URL}/customer-payments/${id}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to fetch customer payment.'));
  }
};

export const createCustomerPayment = async (token: string, data: CustomerPaymentCreateData): Promise<CustomerPayment> => {
  try {
    const response = await axios.post<CustomerPayment>(`${API_BASE_URL}/customer-payments/`, data, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    throw new Error(handleError(error as AxiosError, 'Failed to create customer payment.'));
  }
};

// Update/Delete for Customer Payments are deferred as per plan.

export default {
  getCustomerPayments,
  getCustomerPaymentById,
  createCustomerPayment,
};
