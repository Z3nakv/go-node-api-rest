// Package middleware contiene middlewares HTTP reutilizables para la API.
package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// JWTProtect retorna un middleware de Fiber que exige un header
// "Authorization: Bearer <token>" válido, firmado con HS256 usando secret.
//
// Nota de diseño: para este desafío se implementó un esquema de JWT simple
// y autocontenido (sin base de datos de usuarios) ya que la seguridad con
// JWT es un requisito *opcional* del enunciado. En un escenario real, el
// emisor del token sería un servicio de identidad (Auth0, Cognito, IAM
// propio, etc).
func JWTProtect(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if secret == "" {
			// Si no se configuró JWT_SECRET, la protección queda deshabilitada
			// (útil para desarrollo local / pruebas rápidas).
			return c.Next()
		}

		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "falta el header Authorization: Bearer <token>",
			})
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "token inválido o expirado",
			})
		}

		return c.Next()
	}
}
