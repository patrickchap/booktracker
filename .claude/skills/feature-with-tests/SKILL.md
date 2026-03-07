---
description: Enforce test coverage when implementing features. Use when adding a controller, service, Angular component, or any new endpoint.
triggers:
  - add a feature
  - implement
  - create a new endpoint
  - add a service
  - build
  - create a component
  - new controller
---

# Feature-with-Tests Skill

Whenever implementing a new feature, write tests in the same step — never defer them.

## Backend Tests (xUnit + Moq)

**Location:** `backend/tests/BookTracker.Api.Tests/`
- Controller tests → `Controllers/<Name>ControllerTests.cs`
- Service tests → `Services/<Name>ServiceTests.cs`

**Controller test pattern:**
```csharp
public class MyControllerTests
{
    private readonly Mock<IMyService> _serviceMock;
    private readonly MyController _controller;
    private readonly Guid _testUserId = Guid.NewGuid();

    public MyControllerTests()
    {
        _serviceMock = new Mock<IMyService>();
        _controller = new MyController(_serviceMock.Object);
        // Set JWT claims via ControllerContext
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, _testUserId.ToString()) };
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test")) }
        };
    }
}
```

**Service test pattern (EF Core InMemory):**
```csharp
private static BookTrackerDbContext CreateDb() =>
    new BookTrackerDbContext(
        new DbContextOptionsBuilder<BookTrackerDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
```
- Seed entities directly, instantiate service with `new MyService(db)`
- Use a unique DB name per test (prevents test pollution)

**Required test categories:**
- Happy path (returns correct data)
- Empty/null cases (empty list, null optional fields)
- Unauthorized (missing `NameIdentifier` claim → `UnauthorizedResult`)
- Pagination (page/pageSize offset produces non-overlapping results)

## Frontend Tests (Jasmine + Karma)

**Location:** Co-located with source as `<name>.spec.ts`

**Service test pattern:**
```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MyService],
  });
  service = TestBed.inject(MyService);
  httpMock = TestBed.inject(HttpTestingController);
});
afterEach(() => httpMock.verify());
```
- Use `httpMock.expectOne(r => r.url === '...' && r.params.get('x') === 'y')` for parameterized requests
- Assert signal values after `await promise` + `req.flush(...)`
- Check loading signals: true during request, false after

**Component test pattern:**
```typescript
mockService = jasmine.createSpyObj('MyService', ['loadData'], {
  items: signal([]),
  isLoading: signal(false),
});
mockService.loadData.and.resolveTo();
```
- Use `jasmine.createSpyObj` with signal stubs for readonly signal properties
- Provide via `{ provide: MyService, useValue: mockService }`
- Always include `provideRouter([])` for components with `RouterLink`

**Required test categories:**
- `ngOnInit` triggers the correct service calls
- Signal-based state (loading, data, active tab) reflects expected values
- Lazy loading (first call triggers fetch, subsequent calls do not)
- Component creation (`should create`)
