# Improved Service-Centric Flow Setup

This document explains how to integrate the improved service-centric approach that maintains business organization while providing direct service management capabilities.

## Backend Integration

### 1. Add the Service Router

Add the service router you provided to your FastAPI main application:

```python
# main.py or app.py
from fastapi import FastAPI
from your_service_router import service_router  # Import the service router

app = FastAPI()

# Include the service router
app.include_router(service_router)

# Your existing routers
app.include_router(auth_router)
app.include_router(business_router)
# ... other routers
```

### 2. Add User Services Endpoint

Add an endpoint to get all services a user has access to across all businesses:

```python
# In your business or service router
@router.get("/services/user", response_model=List[ServiceWithBusiness])
def get_user_services(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all services that the user has access to across all businesses."""
    
    # Get all businesses the user has access to
    user_business_ids = {str(link.business_id) for link in current_user.business_links}
    
    # Get all services from those businesses
    services = db.query(models.Service).join(
        models.Business, models.Service.business_id == models.Business.id
    ).filter(
        models.Business.id.in_(user_business_ids),
        models.Service.is_active == True
    ).all()
    
    # Transform to include business information
    result = []
    for service in services:
        user_link = next(
            (link for link in current_user.business_links 
             if str(link.business_id) == str(service.business_id)), 
            None
        )
        
        # Count tables and recent bookings
        table_count = db.query(models.TableResource).filter(
            models.TableResource.service_id == service.id,
            models.TableResource.is_active == True
        ).count()
        
        recent_bookings_count = db.query(models.Booking).filter(
            models.Booking.service_id == service.id,
            models.Booking.created_at >= datetime.now() - timedelta(days=30)
        ).count()
        
        result.append({
            "id": service.id,
            "business_id": service.business_id,
            "business_name": service.business.name,
            "business_role": user_link.role.value if user_link else "unknown",
            "name": service.name,
            "description": service.description,
            "duration_minutes": service.duration_min,
            "price_minor": service.price_minor,
            "is_active": service.is_active,
            "table_count": table_count,
            "recent_bookings_count": recent_bookings_count,
            "created_at": service.created_at,
            "updated_at": service.updated_at,
        })
    
    return result
```

### 3. Add Service Details Endpoint

Add an endpoint to get individual service details:

```python
# In your service router
@service_router.get("/{service_id}", response_model=ServiceWithBusiness)
def get_service_details(
    service_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get detailed information about a specific service."""
    service = require_service_access(current_user, service_id)
    
    # Get business information
    business = service.business
    
    # Get user's role for this business
    user_link = next(
        (link for link in current_user.business_links 
         if str(link.business_id) == str(service.business_id)), 
        None
    )
    
    return {
        "id": service.id,
        "business_id": service.business_id,
        "business_name": business.name,
        "business_role": user_link.role.value if user_link else "unknown",
        "name": service.name,
        "description": service.description,
        "duration_minutes": service.duration_min,
        "price_minor": service.price_minor,
        "is_active": service.is_active,
        "created_at": service.created_at,
        "updated_at": service.updated_at,
    }
```

## Frontend Changes Made

### 1. New Service-Centric Dashboard (`ServiceDashboard.tsx`)
- Replaces the business-centric dashboard
- Shows all services the user has access to across all businesses
- Direct navigation to service management
- Eliminates the business selection step

### 2. Service Management Dashboard (`ServiceManagementDashboard.tsx`)
- Service-specific dashboard with tabs for different functions
- Uses service-centric API endpoints
- Direct management of tables, bookings, and availability for a service

### 3. Updated API Layer (`utils/api.ts`)
- Added `getUserServices()` - gets all user services across businesses
- Added service-centric endpoints that use the service router
- Service-specific operations for tables, bookings, and availability

### 4. New Hook (`useUserServices.tsx`)
- Manages the state for all user services
- Handles loading and error states
- Provides refresh functionality

### 5. Updated Routes (`App.tsx`)
- `/dashboard` → Business dashboard (shows all user businesses)
- `/business/:bizId` → Service selection for specific business
- `/service/:serviceId` → Direct service management
- Keeps existing business routes for business-specific settings

## New User Flow

### Before (Business-Centric):
1. User logs in → `/dashboard`
2. User selects business → `/business/:bizId/select-service`
3. User selects service → `/business/:bizId?service=:serviceId`
4. User manages service through business context

### After (Improved Service-Centric):
1. User logs in → `/dashboard` (business dashboard)
2. User selects business → `/business/:bizId` (service selection for that business)
3. User selects service → `/service/:serviceId` (direct service management)
4. User directly manages service

## Benefits

1. **Better Organization**: Maintains business context while improving service access
2. **Cleaner Service Management**: Direct service URLs and dedicated service interfaces
3. **More Efficient**: Direct API calls to service endpoints once in service context
4. **Better UX**: Clear business → service → management flow
5. **Simplified Navigation**: Fewer clicks to get to actual service operations

## Migration Notes

1. **Backward Compatibility**: Old business-centric routes still work
2. **Gradual Migration**: You can migrate users gradually
3. **Business Settings**: Business-specific settings remain in business routes
4. **Service Creation**: New services still created through business onboarding

## Testing

1. Test that users can see all their services across businesses
2. Verify service-specific operations work correctly
3. Check that access control is properly enforced
4. Test the new navigation flow

## Backend Requirements

Make sure your service router includes all the endpoints used:
- `GET /services/user` - Get all user services
- `GET /services/{service_id}` - Get service details
- `GET /services/{service_id}/tables` - Get service tables
- `POST /services/{service_id}/tables` - Add service table
- `GET /services/{service_id}/bookings` - Get service bookings
- `POST /services/{service_id}/bookings` - Create service booking
- `GET /services/{service_id}/availability` - Check service availability

The service router you provided already includes most of these endpoints! 