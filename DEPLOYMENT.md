# SGPA Calculator Deployment Checklist

## 1. Pre-deployment Checks
- [ ] All files are in the correct directory structure
- [ ] No sensitive information in the code
- [ ] All file permissions are correct
- [ ] Database configuration is ready to be updated

## 2. Hosting Setup
- [ ] Sign up for hosting account
- [ ] Get hosting credentials
- [ ] Note down database credentials
- [ ] Get FTP access details (if applicable)

## 3. Database Setup
- [ ] Create new database in hosting control panel
- [ ] Note down database name
- [ ] Create database user
- [ ] Note down database username and password
- [ ] Update db_config.php with new credentials

## 4. File Upload
- [ ] Upload all files to hosting
- [ ] Verify file permissions
- [ ] Check file structure on server

## 5. Database Initialization
- [ ] Access phpMyAdmin
- [ ] Run setup_database.php
- [ ] Verify tables are created
- [ ] Test database connection

## 6. Testing
- [ ] Test website accessibility
- [ ] Test SGPA calculation
- [ ] Test CGPA calculation
- [ ] Test PDF generation
- [ ] Test database operations

## 7. Security Checks
- [ ] Remove or protect setup_database.php
- [ ] Remove or protect verify_database.php
- [ ] Check file permissions
- [ ] Verify error reporting is disabled in production

## 8. Final Steps
- [ ] Update any hardcoded URLs
- [ ] Test all features
- [ ] Monitor error logs
- [ ] Set up regular backups

## Common Issues and Solutions

### Database Connection Issues
- Verify database credentials
- Check if database exists
- Ensure database user has proper permissions

### File Upload Issues
- Check file permissions
- Verify file paths
- Ensure all files are uploaded

### Website Not Working
- Check error logs
- Verify PHP version compatibility
- Check if all required PHP extensions are enabled

### PDF Generation Issues
- Verify jsPDF library is loaded
- Check browser console for errors
- Ensure proper file permissions

## Maintenance
- Regularly backup database
- Monitor error logs
- Update dependencies
- Check for security updates 