# API Service Layer Documentation

API Service Layer สำหรับ Concert Ticket Web Application

## โครงสร้าง

```
src/api/
├── index.ts          # Central export
├── axios.ts          # Axios instance configuration
├── auth.ts           # Authentication endpoints
├── events.ts         # Events endpoints
├── orders.ts         # Orders endpoints
├── users.ts          # Users management endpoints
├── organizers.ts     # Organizers management endpoints
├── ticketTypes.ts    # Ticket types management endpoints
└── profile.ts        # User profile endpoints
```

## การใช้งาน

### Authentication

```typescript
import { register, login } from '../api';

// สมัครสมาชิก
const registerData = {
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER' as const,
};
await register(registerData);

// เข้าสู่ระบบ
const loginData = {
  email: 'user@example.com',
  password: 'password123',
};
const response = await login(loginData);
localStorage.setItem('token', response.token);
```

### Events

```typescript
import { getEvents, getEventById, createEvent, updateOrganizerEvent } from '../api';

// ดึงรายการงานทั้งหมด
const events = await getEvents({ page: 1, limit: 10 });

// ดึงรายละเอียดงาน
const event = await getEventById(1);

// สร้างงานใหม่ (Organizer only)
const newEvent = await createEvent({
  title: 'Concert 2024',
  description: 'Amazing concert',
  venue: 'Bangkok Arena',
  eventDate: '2024-12-31T20:00:00Z',
  posterUrl: 'https://example.com/poster.jpg',
  ticketTypes: [
    { name: 'VIP', price: 5000, total_quantity: 100 }
  ]
});

// แก้ไขงาน (Organizer only)
await updateOrganizerEvent(1, {
  title: 'Updated Title',
  venue: 'New Venue'
});
```

### Orders

```typescript
import { purchaseTickets, getMyOrders, getOrderById } from '../api';

// ซื้อบัตร
const purchase = await purchaseTickets({
  items: [
    { ticketTypeId: 1, quantity: 2 }
  ]
});

// ดึงคำสั่งซื้อของตัวเอง
const orders = await getMyOrders();

// ดึงรายละเอียดคำสั่งซื้อ
const order = await getOrderById(1);
```

### Users Management (Admin only)

```typescript
import { getUsers, getUserById, updateUser, deleteUser } from '../api';

// ดึงรายการ users
const users = await getUsers({ page: 1, limit: 10, role: 'USER' });

// ดึงข้อมูล user
const user = await getUserById(1);

// อัปเดต user
await updateUser(1, {
  email: 'newemail@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'ADMIN'
});

// ลบ user
await deleteUser(1);
```

### Organizers Management

```typescript
import { getOrganizers, createOrganizer, updateOrganizer } from '../api';

// ดึงรายการ organizers
const organizers = await getOrganizers({ page: 1, limit: 10 });

// สร้าง organizer (Admin only)
await createOrganizer({
  userId: 1,
  companyName: 'Concert Company'
});

// อัปเดต organizer (Admin only)
await updateOrganizer(1, {
  companyName: 'New Company Name'
});
```

### Ticket Types Management

```typescript
import { getTicketTypes, createTicketType, updateTicketType } from '../api';

// ดึงรายการ ticket types
const ticketTypes = await getTicketTypes({ eventId: 1 });

// สร้าง ticket type (Organizer/Admin only)
await createTicketType({
  eventId: 1,
  name: 'VIP',
  price: 5000,
  totalQuantity: 100
});

// อัปเดต ticket type (Organizer/Admin only)
await updateTicketType(1, {
  name: 'Premium VIP',
  price: 6000,
  totalQuantity: 150
});
```

### User Profile

```typescript
import { updateProfile, changePassword } from '../api';

// อัปเดตโปรไฟล์
await updateProfile({
  name: 'John Doe',
  email: 'newemail@example.com'
});

// เปลี่ยนรหัสผ่าน
await changePassword({
  currentPassword: 'oldpassword',
  newPassword: 'newpassword'
});
```

## Error Handling

ทุก API function จะ throw error ถ้าเกิดข้อผิดพลาด ควรใช้ try-catch เพื่อจัดการ:

```typescript
try {
  const events = await getEvents();
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.message);
  } else {
    // Network error
    console.error('Network error:', error.message);
  }
}
```

## TypeScript Types

ทุก API function มี TypeScript types ที่ชัดเจน:

- Request types: `*Request` (เช่น `CreateEventRequest`)
- Response types: `*Response` (เช่น `CreateEventResponse`)
- Query params: `*QueryParams` (เช่น `GetEventsQueryParams`)

## Authentication

API service layer จะใช้ token จาก `localStorage.getItem('token')` อัตโนมัติผ่าน axios interceptor ที่ตั้งค่าไว้ใน `axios.ts`

## Endpoints Coverage

API service layer ครอบคลุม endpoints ทั้งหมดจาก `API_ENDPOINTS_COMPLETE.md`:

- ✅ Authentication (register, login)
- ✅ Events (GET, POST, PUT, DELETE)
- ✅ Orders (purchase, my-orders, order detail, organizer orders, admin orders)
- ✅ Users Management (GET, PUT, DELETE with pagination)
- ✅ Organizers Management (GET, POST, PUT, DELETE with pagination)
- ✅ Ticket Types Management (GET, POST, PUT, DELETE with pagination)
- ✅ User Profile (update profile, change password)

