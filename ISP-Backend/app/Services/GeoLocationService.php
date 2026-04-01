<?php

namespace App\Services;

class GeoLocationService
{
    /**
     * Lookup geo-location from IP address using free ip-api.com.
     *
     * @return array{country: ?string, city: ?string, latitude: ?float, longitude: ?float}
     */
    public static function lookup(string $ip): array
    {
        $default = [
            'country' => null,
            'city' => null,
            'latitude' => null,
            'longitude' => null,
        ];

        // Skip private/local IPs
        if (in_array($ip, ['127.0.0.1', '::1', '0.0.0.0']) || self::isPrivateIp($ip)) {
            return array_merge($default, ['country' => 'Local', 'city' => 'Local']);
        }

        try {
            $response = @file_get_contents("http://ip-api.com/json/{$ip}?fields=status,country,city,lat,lon", false, stream_context_create([
                'http' => ['timeout' => 3],
            ]));

            if (!$response) {
                return $default;
            }

            $data = json_decode($response, true);

            if (($data['status'] ?? '') !== 'success') {
                return $default;
            }

            return [
                'country' => $data['country'] ?? null,
                'city' => $data['city'] ?? null,
                'latitude' => $data['lat'] ?? null,
                'longitude' => $data['lon'] ?? null,
            ];
        } catch (\Throwable $e) {
            \Log::warning('Geo lookup failed: ' . $e->getMessage());
            return $default;
        }
    }

    private static function isPrivateIp(string $ip): bool
    {
        return !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    }
}
