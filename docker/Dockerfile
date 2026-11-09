# syntax=docker.io/docker/dockerfile:1
# Self-contained build: compiles TechnitiumLibrary + DnsServer inside the SDK image,
# then copies the published output onto the upstream runtime base.
# Build from the repo root:  docker build -f docker/Dockerfile .

# Build once on the native builder platform; the output is framework-dependent IL, so it runs on any arch.
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG LIBRARY_REPO=https://github.com/TechnitiumSoftware/TechnitiumLibrary.git
ARG LIBRARY_REF=master
WORKDIR /src
RUN git clone --depth 1 --branch "${LIBRARY_REF}" "${LIBRARY_REPO}" TechnitiumLibrary
RUN dotnet build TechnitiumLibrary/TechnitiumLibrary.ByteTree/TechnitiumLibrary.ByteTree.csproj -c Release \
 && dotnet build TechnitiumLibrary/TechnitiumLibrary.Net/TechnitiumLibrary.Net.csproj -c Release \
 && dotnet build TechnitiumLibrary/TechnitiumLibrary.Security.OTP/TechnitiumLibrary.Security.OTP.csproj -c Release
COPY . DnsServer/
RUN dotnet publish DnsServer/DnsServerApp/DnsServerApp.csproj -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
ADD --link https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb /
RUN <<HEREDOC
  dpkg -i packages-microsoft-prod.deb && rm packages-microsoft-prod.deb
  apt-get update && apt-get install -y libmsquic dnsutils iputils-ping curl
  apt-get clean -y && rm -rf /var/lib/apt/lists/*
  mkdir /etc/dns
HEREDOC

WORKDIR /opt/technitium/dns
COPY --link --from=build /publish /opt/technitium/dns

ENTRYPOINT ["/usr/bin/dotnet", "/opt/technitium/dns/DnsServerApp.dll"]
CMD ["/etc/dns"]

EXPOSE 53/udp 53/tcp 853/udp 853/tcp 443/udp 443/tcp 80/tcp 8053/tcp 5380/tcp 53443/tcp 67/udp

LABEL org.opencontainers.image.title="Technitium DNS Server (refreshed UI)"
LABEL org.opencontainers.image.source="https://github.com/XenoUniv3rse/DnsServer"
LABEL org.opencontainers.image.description="Technitium DNS Server with a modernised web console"
LABEL org.opencontainers.image.licenses="GPL-3.0-or-later"
