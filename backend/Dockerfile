FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/TalentSphereAPI.csproj backend/
RUN dotnet restore backend/TalentSphereAPI.csproj
COPY backend/ backend/
RUN dotnet publish backend/TalentSphereAPI.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5000 \
    ASPNETCORE_HTTP_PORTS=5000 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TalentSphereAPI.dll"]
