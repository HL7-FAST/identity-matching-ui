
export interface UdapMetadata {
    udap_versions_supported: string[];
    udap_profiles_supported: string[];
    udap_authorization_extensions_supported: string[];
    udap_authorization_extensions_required: string[];
    udap_certifications_supported: string[];
    udap_certifications_required: string[];
    grant_types_supported: string[];
    scoped_supported: string[];
    authorization_endpoint: string;
    token_endpoint: string;
    token_endpoint_auth_methods_supported: string[];
    token_endpoint_auth_signing_alg_values_supported: string[];
    registration_endpoint: string;
    registration_endpoint_jwt_signing_alg_values_supported: string[];
    signed_metadata: string;
}

export interface UdapSoftwareStatement {
    iss?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    iat?: number;
    jti: string;
    client_name: string;
    redirect_uris?: string[];
    contacts: string[];
    logo_uri: string;
    grant_types: string[];
    response_types?: string[];
    token_endpoint_auth_method: string;
    scope: string;
}
