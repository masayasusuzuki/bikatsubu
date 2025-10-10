-- Add user_name column to admin_login_history table
ALTER TABLE admin_login_history
ADD COLUMN user_name TEXT;

-- Update existing records with user names based on email
UPDATE admin_login_history
SET user_name = CASE
    WHEN email = 'm.suzuki@logicajapan.net' THEN '鈴木(LOGICA)'
    WHEN email = 'logica.marketing.depertment@gmail.com' THEN 'LOGICAメンバー'
    WHEN email = 'segawa@logicajapan.net' THEN '瀬川(LOGICA)'
    WHEN email = 'honda@infix-inc.com' THEN '本田(INFIX)'
    ELSE email
END;

-- Make user_name NOT NULL after setting values
ALTER TABLE admin_login_history
ALTER COLUMN user_name SET NOT NULL;

-- Create a function to automatically set user_name based on email
CREATE OR REPLACE FUNCTION set_user_name_from_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_name := CASE
        WHEN NEW.email = 'm.suzuki@logicajapan.net' THEN '鈴木(LOGICA)'
        WHEN NEW.email = 'logica.marketing.depertment@gmail.com' THEN 'LOGICAメンバー'
        WHEN NEW.email = 'segawa@logicajapan.net' THEN '瀬川(LOGICA)'
        WHEN NEW.email = 'honda@infix-inc.com' THEN '本田(INFIX)'
        ELSE NEW.email
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set user_name on insert
CREATE TRIGGER set_user_name_before_insert
    BEFORE INSERT ON admin_login_history
    FOR EACH ROW
    EXECUTE FUNCTION set_user_name_from_email();

-- Comment on the column
COMMENT ON COLUMN admin_login_history.user_name IS 'Display name for the user in login history';
