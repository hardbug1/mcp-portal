import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { config } from './env';
import { UserRole } from '../types/user';

const prisma = new PrismaClient();

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtSecret,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            workspaces: {
              include: {
                workspace: true,
              },
            },
          },
        });

        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
if (config.googleClientId && config.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: `${config.appUrl}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await prisma.user.findUnique({
            where: { email: profile.emails?.[0]?.value },
          });

          if (user) {
            // Update OAuth info if user exists
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                lastLoginAt: new Date(),
              },
            });
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || '',
                avatar: profile.photos?.[0]?.value,
                googleId: profile.id,
                role: UserRole.USER,
                isEmailVerified: true, // Google emails are verified
                lastLoginAt: new Date(),
              },
            });

            // Create default workspace for new user
            const workspace = await prisma.workspace.create({
              data: {
                name: `${user.name}'s Workspace`,
                description: 'Default workspace',
                ownerId: user.id,
              },
            });

            // Add user to workspace
            await prisma.userWorkspace.create({
              data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: 'OWNER',
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (config.githubClientId && config.githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.githubClientId,
        clientSecret: config.githubClientSecret,
        callbackURL: `${config.appUrl}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // GitHub might not provide email in profile, so we need to fetch it
          const email = profile.emails?.[0]?.value || profile.email;
          
          if (!email) {
            return done(new Error('No email found in GitHub profile'), null);
          }

          // Check if user already exists
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Update OAuth info if user exists
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                githubId: profile.id,
                avatar: profile.photos?.[0]?.value,
                lastLoginAt: new Date(),
              },
            });
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || profile.username || '',
                avatar: profile.photos?.[0]?.value,
                githubId: profile.id,
                role: UserRole.USER,
                isEmailVerified: true, // GitHub emails are verified
                lastLoginAt: new Date(),
              },
            });

            // Create default workspace for new user
            const workspace = await prisma.workspace.create({
              data: {
                name: `${user.name}'s Workspace`,
                description: 'Default workspace',
                ownerId: user.id,
              },
            });

            // Add user to workspace
            await prisma.userWorkspace.create({
              data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: 'OWNER',
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport; 