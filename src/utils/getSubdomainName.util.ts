function getSubdomainName(domainName: string) {
  const parts = domainName.split('.');
  return parts[parts.length - 1];
}

export { getSubdomainName };
