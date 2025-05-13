# Authentication System

This document provides a detailed overview of the JWT-based authentication system implemented in Schedulify.

## Features

- Local authentication (email/password)
- OAuth2 integration (Google, Facebook)
- Email verification
- Password reset
- JWT token management (access/refresh tokens)

## Database Model

The User model (`models/user.model.js`) includes:

```js
{
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Only required if not using OAuth
      return this.authType === 'local';
    }
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  },
  authType: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  oauthId: {
    type: String,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }],
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/verify-email | Verify user's email address |
| POST | /api/auth/login | Authenticate user and receive tokens |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password with token |
| POST | /api/auth/logout | Invalidate refresh token |
| GET | /api/auth/me | Get current user information |
| GET | /api/auth/google | Initiate Google OAuth flow |
| GET | /api/auth/google/callback | Google OAuth callback |
| GET | /api/auth/facebook | Initiate Facebook OAuth flow |
| GET | /api/auth/facebook/callback | Facebook OAuth callback |

## Token Management

- **Access Token**: Short-lived JWT (30 minutes) containing user ID and roles
- **Refresh Token**: Long-lived token (7 days) stored in the database and used to issue new access tokens
- Token rotation: Each time a refresh token is used, a new one is issued and the old one is invalidated

## Implementation Details

### Authentication Flow

#### Local Authentication
1. User registers with email, password, and profile details
2. A verification email is sent to the user's email address
3. After verifying their email, the user can log in
4. On login, the system issues an access token and refresh token
5. The access token is used to authorize all protected API requests
6. When the access token expires, the refresh token can be used to obtain a new access token

#### OAuth Flow
1. User initiates OAuth (Google/Facebook) by visiting `/api/auth/google` or `/api/auth/facebook`
2. User is redirected to the provider's authentication page
3. After successful authentication, the provider redirects back to our callback URL
4. The system creates or updates the user record based on OAuth profile data
5. The user is authenticated and receives tokens similar to local authentication

## OAuth Implementation Details

### Backend Implementation
The backend uses Passport.js strategies to handle OAuth authentication:

1. **Configuration**: OAuth providers are configured in `config/passport.js`
   ```javascript
   // Google Strategy configuration
   passport.use(
     new GoogleStrategy(
       {
         clientID: env.GOOGLE_CLIENT_ID,
         clientSecret: env.GOOGLE_CLIENT_SECRET,
         callbackURL: '/api/auth/google/callback',
         scope: ['profile', 'email']
       },
       async (accessToken, refreshToken, profile, done) => {
         try {
           // Find or create user logic
           // ...
         } catch (error) {
           return done(error, null);
         }
       }
     )
   );

   // Facebook Strategy configuration
   passport.use(
     new FacebookStrategy(
       {
         clientID: env.FACEBOOK_APP_ID,
         clientSecret: env.FACEBOOK_APP_SECRET,
         callbackURL: '/api/auth/facebook/callback',
         profileFields: ['id', 'emails', 'name', 'picture.type(large)']
       },
       async (accessToken, refreshToken, profile, done) => {
         try {
           // Find or create user logic
           // ...
         } catch (error) {
           return done(error, null);
         }
       }
     )
   );
   ```

2. **OAuth Routes**: Routes are defined in `routes/auth.routes.js` for initiating the OAuth flow and handling callbacks
   ```javascript
   // Google OAuth routes
   router.get(
     '/google',
     passport.authenticate('google', { scope: ['profile', 'email'] })
   );

   router.get(
     '/google/callback',
     passport.authenticate('google', { session: false, failureRedirect: '/login' }),
     authController.handleOAuthCallback
   );

   // Facebook OAuth routes
   router.get(
     '/facebook',
     passport.authenticate('facebook', { scope: ['email'] })
   );

   router.get(
     '/facebook/callback',
     passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
     authController.handleOAuthCallback
   );
   ```

3. **User Management**: When a user authenticates with OAuth, the system:
   - Checks if a user with the same email or OAuth ID exists
   - If found, updates the user's OAuth credentials if needed
   - If not found, creates a new user with information from the OAuth profile
   - Sets the user as verified (email verification is bypassed for OAuth users)

4. **Callback Handling**: When an OAuth provider redirects back to our callback URL, Passport.js authenticates the user and passes control to `authController.handleOAuthCallback`
   ```javascript
   exports.handleOAuthCallback = async (req, res) => {
     try {
       // Generate tokens after successful authentication
       const accessToken = generateAccessToken(req.user._id);
       const refreshToken = generateRefreshToken();
       const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

       // Save refresh token to user
       req.user.refreshTokens.push({
         token: refreshToken,
         expiresAt: refreshExpires
       });
       req.user.lastLogin = Date.now();
       
       await req.user.save();
       
       // Redirect to frontend with tokens
       return res.redirect(`${env.FRONTEND_URL}/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
     } catch (error) {
       logger.error('OAuth callback error:', error);
       return res.redirect(`${env.FRONTEND_URL}/login?error=true`);
     }
   };
   ```

### Frontend Implementation
The frontend components for OAuth authentication include:

1. **OAuth Buttons**: The `OAuthButtons` component provides Google and Facebook login buttons
   ```tsx
   const OAuthButtons: React.FC = () => {
     const handleGoogleLogin = () => {
       window.location.href = '/api/auth/google';
     };

     const handleFacebookLogin = () => {
       window.location.href = '/api/auth/facebook';
     };

     return (
       <Box>
         <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 3 }}>
           <Divider sx={{ flexGrow: 1 }} />
           <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
             OR
           </Typography>
           <Divider sx={{ flexGrow: 1 }} />
         </Box>
         
         <Stack spacing={2}>
           <Button
             variant="outlined"
             fullWidth
             startIcon={<GoogleIcon />}
             onClick={handleGoogleLogin}
             sx={{ textTransform: 'none' }}
           >
             Continue with Google
           </Button>
           
           <Button
             variant="outlined"
             fullWidth
             startIcon={<FacebookIcon />}
             onClick={handleFacebookLogin}
             sx={{ textTransform: 'none' }}
           >
             Continue with Facebook
           </Button>
         </Stack>
       </Box>
     );
   };
   ```

2. **OAuth Callback Component**: After OAuth authentication, the backend redirects to `/oauth-callback` in the frontend with tokens as query parameters
   ```tsx
   const OAuthCallback: React.FC = () => {
     const [error, setError] = useState<string | null>(null);
     const [loading, setLoading] = useState(true);
     const navigate = useNavigate();
     const location = useLocation();

     useEffect(() => {
       const processCallback = async () => {
         try {
           // Get access token and refresh token from URL query parameters
           const queryParams = new URLSearchParams(location.search);
           const accessToken = queryParams.get('accessToken');
           const refreshToken = queryParams.get('refreshToken');
           const errorParam = queryParams.get('error');
           
           if (errorParam) {
             setError('Authentication failed. Please try again.');
             setLoading(false);
             return;
           }

           if (!accessToken || !refreshToken) {
             setError('Invalid authentication response. Please try again.');
             setLoading(false);
             return;
           }

           // Store tokens
           setStoredTokens(accessToken, refreshToken);
           
           // Redirect to dashboard
           setTimeout(() => {
             navigate('/');
           }, 1000);
         } catch (err) {
           setError('Failed to process authentication. Please try again.');
           setLoading(false);
         }
       };

       processCallback();
     }, [location, navigate]);

     // render loading state or success/error messages
   };
   ```

3. **Route Configuration**: The OAuth callback route is defined in the application's routing system
   ```tsx
   function AppRoutes() {
     return (
       <Routes>
         {/* Other routes */}
         <Route path="/oauth-callback" element={<OAuthCallback />} />
         {/* Other routes */}
       </Routes>
     );
   }
   ```

### Detailed OAuth Flow

1. **Initiating OAuth**:
   - User clicks on "Continue with Google" or "Continue with Facebook" button
   - Frontend redirects to `/api/auth/google` or `/api/auth/facebook` endpoint
   - Backend uses Passport.js to redirect to the OAuth provider's authentication page

2. **Provider Authentication**:
   - User authenticates with the OAuth provider (Google or Facebook)
   - Provider redirects back to our callback URL with an authorization code

3. **Callback Processing**:
   - Passport.js receives the callback and exchanges the authorization code for an access token
   - Passport.js retrieves the user's profile information from the provider
   - Our callback handler either finds an existing user or creates a new one
   - Server generates JWT access and refresh tokens for the user
   - Backend redirects to the frontend's `/oauth-callback` route with tokens as query parameters

4. **Frontend Token Processing**:
   - The `OAuthCallback` component extracts tokens from the URL
   - Tokens are stored in local storage
   - User is redirected to the dashboard
   - The user is now authenticated and can access the application

### Configuration Requirements

For OAuth authentication to work properly:

1. **Environment Variables**: 
   The following variables must be set in the `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   FRONTEND_URL=http://localhost:3000
   ```

2. **Redirect URIs**:
   The OAuth provider configurations must include the correct callback URLs:
   - Google: `http://localhost:5000/api/auth/google/callback` (for development)
   - Facebook: `http://localhost:5000/api/auth/facebook/callback` (for development)

3. **Provider App Setup**:
   - Google: Enable the Google+ API in your Google Cloud Console project
   - Facebook: Add the Facebook Login product to your Facebook app

4. **Security Considerations**:
   - Store OAuth secrets securely and never commit them to version control
   - Use HTTPS in production environments
   - Validate the state parameter in OAuth flows to prevent CSRF attacks
   - Consider implementing additional security measures like rate limiting

## Password Management

### Password Storage
- Passwords are hashed using bcrypt with an appropriate work factor
- Plain text passwords are never stored in the database
- Password hashing is handled automatically by mongoose pre-save hooks

### Password Change
Users can change their password once they are authenticated:
1. The user must provide their current password for verification
2. The new password must be at least 8 characters long
3. When a password is changed, all refresh tokens are invalidated for security reasons

**Endpoint**: `POST /api/auth/change-password`
```javascript
// Request body
{
  "currentPassword": "user's current password",
  "newPassword": "new password"
}

// Response (200 OK)
{
  "success": true,
  "message": "Password changed successfully. Please login again with your new password."
}
```

### Password Reset
For users who forget their password:
1. User requests a password reset by providing their email
2. A password reset token is generated and sent to the user's email
3. User clicks the link and sets a new password
4. All existing refresh tokens are invalidated when a password is reset

## Code Structure

- `controllers/auth.controller.js` - Handles HTTP requests for authentication
- `services/auth.service.js` - Contains authentication business logic
- `middleware/auth.middleware.js` - JWT verification middleware
- `utils/token.utils.js` - JWT generation and validation functions
- `config/passport.js` - OAuth strategy configuration

## Example: JWT Verification Middleware

```js
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub };
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};
```
