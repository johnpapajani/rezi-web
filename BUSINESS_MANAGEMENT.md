# Business Management Feature

This document describes the business account management functionality added to the Rezi web application.

## Overview

The business management feature allows users to configure and manage their business details, including:

- Basic business information (name, logo)
- Regional settings (currency, timezone)
- Address information
- Business settings and configuration

## Components Added

### 1. Business Types (`src/types/index.ts`)
- `Business` interface - Complete business data structure
- `BusinessCreate` interface - Structure for creating new businesses
- `BusinessUpdate` interface - Partial update structure for PATCH requests

### 2. Business API (`src/utils/api.ts`)
- `businessApi.listUserBusinesses()` - Fetch all user's businesses with roles
- `businessApi.createBusiness(businessData)` - Create a new business
- `businessApi.getBusiness(bizId)` - Fetch business details
- `businessApi.updateBusiness(bizId, updates)` - Update business information

### 3. Business Hooks
- `useBusiness()` (`src/hooks/useBusiness.tsx`) - Manage individual business data
  - Handles loading states, error handling, and updates
  - Provides `business`, `loading`, `error`, `updating`, `updateBusiness`, and `refetch`
- `useBusinessCreate()` (`src/hooks/useBusinessCreate.tsx`) - Manage business creation
  - Handles business creation with validation and error handling
  - Provides `creating`, `error`, `createBusiness`, and `clearError`
- `useUserBusinesses()` (`src/hooks/useUserBusinesses.tsx`) - Manage user's business list
  - Fetches all businesses with user roles
  - Provides `businesses`, `loading`, `error`, and `refetch`

### 4. Business Creation Page (`src/components/pages/CreateBusiness.tsx`)
- Comprehensive form for creating new businesses
- Auto-generates URL slug from business name with validation
- Organized into sections: Basic Information, Regional Settings, Address Information
- Real-time validation and error handling with backend-specific errors (slug conflicts)
- Success/error notifications
- Automatically redirects to new business management page after creation
- Makes creator the business owner
- Responsive design with Tailwind CSS

### 5. Business Management Page (`src/components/pages/BusinessManagement.tsx`)
- Comprehensive form for editing business details
- Organized into sections: Basic Information, Regional Settings, Address Information
- Real-time validation and error handling
- Success/error notifications
- Responsive design with Tailwind CSS

### 6. Business List Page (`src/components/pages/BusinessList.tsx`)
- Real-time overview of all user businesses from API
- Displays user role for each business (Owner, Manager, Employee)
- Quick access to manage individual businesses
- "Create New Business" button for business creation
- Handles loading and error states
- Card-based layout with business previews and role badges
- Empty state with call-to-action to create first business

## Routes Added

- `/businesses` - List all user businesses
- `/business/create` - Create a new business
- `/business/:bizId` - Manage specific business details

## Backend Integration

The frontend integrates with the following backend endpoints:

```python
# List user's businesses with roles
GET /business/
Response: List[BusinessWithRole]

# Create a new business
POST /business/
Body: BusinessCreate schema
Response: BusinessOut schema (201 status)

# Get business details
GET /business/{biz_id}
Response: BusinessOut schema

# Update business details  
PATCH /business/{biz_id}
Body: BusinessUpdate schema
Response: BusinessOut schema
```

## Usage

1. **Access from Dashboard**: Click on the business stats card or "Manage Business" in the getting started section
2. **Business List**: View all businesses and select one to manage, or create a new business
3. **Business Creation**: Create a new business with automatic slug generation and validation
4. **Business Management**: Edit business details using the comprehensive form
5. **Save Changes**: Only modified fields are sent to the backend for efficiency

## Features

- **Real-time Data**: Fetches actual business data from API
- **Role-based Access**: Displays user roles (Owner, Manager, Employee) for each business
- **Dynamic Dashboard**: Business count and management links update based on actual data
- **Multilingual Support**: Full translation support for Albanian and English
- **Form Validation**: Required fields and proper input types
- **Change Detection**: Only sends modified fields to reduce API calls
- **Loading States**: Visual feedback during API operations
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation when updates are successful
- **Responsive Design**: Works on desktop and mobile devices
- **Navigation**: Easy navigation between dashboard, business list, and management pages

## Multilingual Support

The business management system is fully translatable and supports:

- **Albanian (sq)**: Complete translation for all business management features
- **English (en)**: Full English language support
- **Dynamic Language Switching**: Users can switch languages and all business pages update immediately
- **Consistent Terminology**: Role names, form labels, and messages are consistently translated

### Translation Keys Added

- `business.create.*` - Business creation page translations
- `business.management.*` - Business management page translations
- `business.sections.*` - Form section titles
- `business.fields.*` - Form field labels and placeholders
- `business.list.*` - Business list page translations
- `business.roles.*` - Business role names
- `dashboard.business.*` - Dashboard business section translations

## Future Enhancements

- Image upload for logos with file handling
- More comprehensive address validation with geocoding
- Business deletion/archiving functionality
- Multi-business switching in dashboard
- Business analytics and insights
- Team member management and invitations
- Business settings and preferences
- Additional language support (Italian, German, etc.) 