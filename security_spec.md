# HomeMeal Security Specification

## Data Invariants
1. A user can only have one profile, and they can only edit their own.
2. Only users with the 'provider' role can create or delete meals.
3. Providers can only delete meals they created.
4. Anyone (even signed out) can view meals (browsing).
5. Only signed-in 'student' users can create orders.
6. A user can only see orders they are involved in (students see their own, providers see orders for their meals).
7. Only providers can update an order's status to 'delivered'.
8. Reviews can only be created by signed-in users for meals they have potentially ordered (though we'll keep it simple: any signed-in user for now).
9. Once an order is 'delivered', it cannot revert to 'pending'.

## The "Dirty Dozen" Payloads (Deny Cases)

1. **Identity Spoofing**: Student trying to create a user profile with another user's UID.
2. **Privilege Escalation**: Student trying to set their role to 'provider' after registration or during update.
3. **Malicious Meal Injection**: Student trying to create a meal.
4. **Meal Hijacking**: Provider trying to delete a meal owned by another provider.
5. **Ghost Field Update**: Adding `isVerified: true` to a meal.
6. **Order Tampering**: Student trying to update order status to 'delivered'.
7. **Order Infiltration**: User A trying to view Order B (which belongs to User C and Provider D).
8. **Denial of Wallet**: Creating a meal with a 2MB title string.
9. **ID Poisoning**: Creating a meal with the ID `../dangerous/path`.
10. **State Shortcut**: Updating an order status from 'delivered' back to 'pending'.
11. **PII Leak**: Guest user trying to read all user profiles.
12. **Orphaned Write**: Creating an order for a `mealId` that doesn't exist.

## Test Strategy
The tests will verify that specifically matched `allow` blocks and `isValid` helpers correctly reject these payloads.
