
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJBBFvS55TqmrxMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi12aHo4aGR1Mm1uMHpkc29mLnVzLmF1dGgwLmNvbTAeFw0yMjEyMTYw
NjM3NDVaFw0zNjA4MjQwNjM3NDVaMCwxKjAoBgNVBAMTIWRldi12aHo4aGR1Mm1u
MHpkc29mLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBALeIIqDqyTl8cofanY23Z4g+IOuVFQeVk5olhxoEtrTQBSUzy9VYWwo7rZpa
+Vm5Btu9jMBhLhUCBz9EVb/gGbqGOVYmJlaM9GqNWboNtttLgXY6ijbRKjwgt4nH
7lyV5kYEmFjIMZg4PV+dXCckzAPW+T9PSH7cvdhPRMhmGI024CHJO29Ru5Q4ipoI
Ji68PeGGxLLXmMBDwB70jPdTnSEa4MNcuKLX79ROJlYaXe7wXy4l2rqPsNbJTIef
eZwtx9bko0B/5HKeauHzad5fq61mfNKmK8GHgpdetI77nEgMK4Oj/oc8CsNqohos
D7oQFGbHpPefHUFVIZh6fIzZ/GcCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUnCFZqiwHKYK1MRrpN0+v5wYzCBIwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAzwMWLDl0HgoIYL+UMntYLOJOu6s6XF5j1KwxrnvTT
Wb1nBztYahcMaFnG5H4IIzfurr7U14ZVWneksACU8hilRIP1WV7klNhau6H5xqz1
ZccuTrcrjxQSfrQ7x3Y8VSTFwwYqXCR9jSlk0kNudobtszupDJvDhybzH/n+Zw7P
nzgV/Q8XqJ0y8jW6DgCQgTCgMb8DUWOvU1nAlvquqorFqBCuUJXdLafGFjgjZOEq
8QE1eW+5CajwVt+FqAuLZr5LOvG/c2al+/kF6q3oGFFsghnZ4oChVdOISblDuRtm
AMR25l63b32se803HcDaAFQdfj6s9SrmilTc991nPQ4k
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}