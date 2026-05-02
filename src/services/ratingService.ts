/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, Meal } from '../types';

export const updateAverageRating = async (mealId: string, providerId: string) => {
  try {
    // 1. Get all reviews for the meal
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('mealId', '==', mealId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    let totalRating = 0;
    snapshot.forEach((doc) => {
      totalRating += doc.data().rating;
    });

    const averageRating = totalRating / snapshot.size;

    // 2. Update the meal document
    await updateDoc(doc(db, 'meals', mealId), {
      rating: averageRating,
      reviewCount: snapshot.size
    });

    // 3. Update the provider's overall rating
    // Get all meals for this provider and their ratings
    const mealsRef = collection(db, 'meals');
    const mealsQ = query(mealsRef, where('providerId', '==', providerId));
    const mealsSnapshot = await getDocs(mealsQ);

    let providerTotalRating = 0;
    let providerTotalReviews = 0;

    mealsSnapshot.forEach((mealDoc) => {
      const data = mealDoc.data();
      if (data.rating) {
        providerTotalRating += (data.rating * (data.reviewCount || 0));
        providerTotalReviews += (data.reviewCount || 0);
      }
    });

    if (providerTotalReviews > 0) {
      await updateDoc(doc(db, 'users', providerId), {
        rating: providerTotalRating / providerTotalReviews,
        reviewCount: providerTotalReviews
      });
    }
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
};
