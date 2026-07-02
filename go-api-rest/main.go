package main

import (
	"GO-API-REST/client"
	"GO-API-REST/handlers"
	"log"
	"os"

	customMiddleware "GO-API-REST/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// MatrixRequest representa el body esperado por POST /api/matrix/qr
type MatrixRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {

	nodeAPIURL := getEnv("NODE_API_URL", "http://localhost:3000")
	jwtSecret := os.Getenv("JWT_SECRET")

	app := fiber.New()

	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} (${latency})\n",
	}))

	app.Use(cors.New())

	statsClient := client.NewStatsClient(nodeAPIURL)
	h := handlers.NewHandler(statsClient)

	app.Get("/health", h.HealthCheck)

	api := app.Group("/api", customMiddleware.JWTProtect(jwtSecret))

	api.Post("/matrix/qr", h.PostMatrixQR)

	app.Post("/api/matrix/qr", func(c *fiber.Ctx) error {
		var req MatrixRequest

		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "body inválido, se esperaba { \"matrix\": [[...]] }",
			})
		}

		// Por ahora solo devolvemos lo que recibimos, para confirmar
		// que el parseo funciona. Acá después va la lógica de QR.
		return c.JSON(fiber.Map{
			"received": req.Matrix,
			"rows":     len(req.Matrix),
		})
	})

	log.Fatal(app.Listen(":8080"))
}
