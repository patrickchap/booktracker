# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY BookTracker.sln .
COPY src/BookTracker.Api/BookTracker.Api.csproj src/BookTracker.Api/
COPY src/BookTracker.Application/BookTracker.Application.csproj src/BookTracker.Application/
COPY src/BookTracker.Domain/BookTracker.Domain.csproj src/BookTracker.Domain/
COPY src/BookTracker.Infrastructure/BookTracker.Infrastructure.csproj src/BookTracker.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build and publish
RUN dotnet publish src/BookTracker.Api/BookTracker.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

ENTRYPOINT ["dotnet", "BookTracker.Api.dll"]
