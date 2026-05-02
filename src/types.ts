/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  STUDENT = 'student',
  PROVIDER = 'provider',
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: number;
}

export interface Meal {
  id: string;
  title: string;
  price: number;
  category: 'veg' | 'non-veg';
  imageUrl: string;
  providerId: string;
  providerName: string;
  rating?: number;
  reviewCount?: number;
  createdAt: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  mealId: string;
  mealTitle: string;
  mealPrice: number;
  mealImageUrl: string;
  providerId: string;
  status: OrderStatus;
  timestamp: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  mealId: string;
  rating: number;
  comment: string;
  timestamp: number;
}
