-- Just update existing users with Indian names
UPDATE profiles SET full_name = 'Rajesh Kumar' WHERE employee_id = 'ADMIN001';
UPDATE profiles SET full_name = 'Priya Sharma' WHERE employee_id = 'SME_HR001';
UPDATE profiles SET full_name = 'Amit Patel' WHERE employee_id = 'SME_CIT001';
UPDATE profiles SET full_name = 'Neha Gupta' WHERE employee_id = 'SME_COM001';
UPDATE profiles SET full_name = 'Vikram Singh' WHERE employee_id = 'USER001';