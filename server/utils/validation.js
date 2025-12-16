const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('employee', 'admin', 'hr').default('employee'),
  department: Joi.string().optional(),
  employeeId: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Challenge validation schemas
const createChallengeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).required(),
  type: Joi.string().valid('steps', 'meditation', 'workout', 'hydration', 'sleep', 'custom').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  rules: Joi.object({
    targetValue: Joi.number().positive().required(),
    unit: Joi.string().valid('steps', 'minutes', 'sessions', 'glasses', 'hours').required(),
    pointMultiplier: Joi.number().positive().default(1)
  }).required(),
  maxParticipants: Joi.number().positive().optional(),
  isTeamChallenge: Joi.boolean().default(false),
  rewards: Joi.object({
    firstPlace: Joi.object({
      points: Joi.number().min(0).default(0)
    }).optional(),
    participation: Joi.object({
      points: Joi.number().min(0).default(0)
    }).optional()
  }).optional()
});

// Activity validation schemas
const logActivitySchema = Joi.object({
  type: Joi.string().valid('steps', 'meditation', 'workout', 'hydration', 'sleep', 'yoga', 'walking', 'running', 'cycling', 'other').required(),
  title: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  value: Joi.number().min(0).required(),
  unit: Joi.string().valid('steps', 'minutes', 'hours', 'sessions', 'glasses', 'km', 'calories').required(),
  challenge: Joi.string().optional(),
  activityDate: Joi.date().optional(),
  metadata: Joi.object({
    duration: Joi.number().optional(),
    distance: Joi.number().optional(),
    calories: Joi.number().optional(),
    heartRate: Joi.number().optional(),
    device: Joi.string().optional(),
    deviceId: Joi.string().optional()
  }).optional()
});

// Booking validation schemas
const createBookingSchema = Joi.object({
  sessionType: Joi.string().valid('yoga', 'meditation', 'counseling', 'webinar', 'fitness', 'nutrition', 'wellness-coaching').required(),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  instructor: Joi.string().optional(),
  scheduledDate: Joi.date().greater('now').required(),
  duration: Joi.number().positive().default(60),
  location: Joi.string().valid('online', 'onsite', 'hybrid').default('online'),
  meetingLink: Joi.string().uri().optional(),
  notes: Joi.string().max(1000).optional()
});

// Resource validation schemas
const createResourceSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).required(),
  type: Joi.string().valid('article', 'video', 'podcast', 'ebook', 'worksheet', 'tool', 'app').required(),
  category: Joi.string().valid('stress-management', 'anxiety', 'depression', 'mindfulness', 'sleep', 'work-life-balance', 'relationships', 'self-care', 'general').required(),
  tags: Joi.array().items(Joi.string()).optional(),
  content: Joi.object({
    url: Joi.string().uri().optional(),
    embedCode: Joi.string().optional(),
    text: Joi.string().optional(),
    fileUrl: Joi.string().uri().optional()
  }).required(),
  thumbnail: Joi.string().uri().optional(),
  author: Joi.string().optional(),
  duration: Joi.number().min(0).optional(),
  language: Joi.string().valid('en', 'es', 'fr', 'de', 'hi').default('en'),
  isAnonymous: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false)
});

// Reward validation schemas
const createRewardSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).required(),
  type: Joi.string().valid('physical', 'digital', 'experience', 'discount', 'badge', 'points').required(),
  category: Joi.string().valid('wellness', 'fitness', 'mental-health', 'nutrition', 'lifestyle', 'general').default('general'),
  pointsCost: Joi.number().min(0).required(),
  image: Joi.string().uri().optional(),
  availability: Joi.object({
    total: Joi.number().positive().allow(null).optional()
  }).optional(),
  expiryDate: Joi.date().greater('now').optional(),
  redemptionInstructions: Joi.string().max(1000).optional(),
  partner: Joi.object({
    name: Joi.string().optional(),
    contact: Joi.string().optional()
  }).optional()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createChallengeSchema,
  logActivitySchema,
  createBookingSchema,
  createResourceSchema,
  createRewardSchema
};

