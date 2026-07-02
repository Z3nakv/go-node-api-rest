package handlers

import (
	"github.com/gofiber/fiber/v2"
	"GO-API-REST/linalg"
	"GO-API-REST/client"
)

type MatrixRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

type QRResponse struct {
	Q     linalg.Matrix         `json:"q"`
	R     linalg.Matrix         `json:"r"`
	Stats *client.StatsResponse `json:"stats"`
}

type Handler struct{
	StatsClient *client.StatsClient
}

func NewHandler(statsClient *client.StatsClient) *Handler {
	return &Handler{
		StatsClient: statsClient,
	}
}

func (h *Handler) HealthCheck(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	}

func (h *Handler) PostMatrixQR(c *fiber.Ctx) error {
	var req MatrixRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "body inválido, se espera JSON con la forma { \"matrix\": [[...], [...]] }",
		})
	}

	q, r, err := linalg.QRDecompose(req.Matrix)
	if err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	stats, err := h.StatsClient.FetchStats(c.Context(), q, r)
	if err != nil {
		// La factorización SÍ se calculó correctamente; el problema fue en la
		// comunicación con el servicio downstream. Se informa con 502 Bad
		// Gateway, que es semánticamente correcto para fallos de servicios
		// dependientes, y se incluye igualmente Q y R para no perder trabajo
		// ya realizado.
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "no se pudo obtener estadísticas de node-api: " + err.Error(),
			"q":     q,
			"r":     r,
		})
	}

	return c.JSON(QRResponse{Q: q, R: r, Stats: stats})
}