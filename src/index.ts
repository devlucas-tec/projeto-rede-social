import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Skin = {
  id: number;
  name: string;
  weapon: string;
  rarity: string;
  condition: string;
  price: number;
  imageUrl?: string;
};

type SkinInput = Omit<Skin, "id">;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataFile = join(__dirname, "../data/skins.json");

function ensureDatabase() {
  const folder = dirname(dataFile);
  if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
  if (!existsSync(dataFile)) writeFileSync(dataFile, "[]", "utf8");
}

function readSkins(): Skin[] {
  ensureDatabase();
  return JSON.parse(readFileSync(dataFile, "utf8")) as Skin[];
}

function saveSkins(skins: Skin[]) {
  ensureDatabase();
  writeFileSync(dataFile, JSON.stringify(skins, null, 2), "utf8");
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function getId(url: string): number | null {
  const match = url.match(/^\/api\/skins\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function validateSkin(body: unknown): body is SkinInput {
  if (!body || typeof body !== "object") return false;
  const item = body as Record<string, unknown>;
  return (
    typeof item.name === "string" && item.name.trim().length > 0 &&
    typeof item.weapon === "string" && item.weapon.trim().length > 0 &&
    typeof item.rarity === "string" && item.rarity.trim().length > 0 &&
    typeof item.condition === "string" && item.condition.trim().length > 0 &&
    typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0 &&
    (item.imageUrl === undefined || typeof item.imageUrl === "string")
  );
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, null);
      return;
    }

    const url = req.url ?? "/";

    if (req.method === "GET" && url === "/api/skins") {
      sendJson(res, 200, readSkins());
      return;
    }

    if (req.method === "GET" && url === "/api/skins/stats") {
      const skins = readSkins();
      const totalValue = skins.reduce((sum, skin) => sum + skin.price, 0);
      sendJson(res, 200, {
        total: skins.length,
        totalValue: Number(totalValue.toFixed(2)),
        averagePrice: skins.length
          ? Number((totalValue / skins.length).toFixed(2))
          : 0
      });
      return;
    }

    const id = getId(url);

    if (req.method === "GET" && id !== null) {
      const skin = readSkins().find(item => item.id === id);
      if (!skin) {
        sendJson(res, 404, { error: "Skin não encontrada." });
        return;
      }
      sendJson(res, 200, skin);
      return;
    }

    if (req.method === "POST" && url === "/api/skins") {
      const body = await readBody(req);

      if (!validateSkin(body)) {
        sendJson(res, 400, {
          error: "Dados inválidos.",
          required: ["name", "weapon", "rarity", "condition", "price"]
        });
        return;
      }

      const skins = readSkins();
      const newId = skins.length
        ? Math.max(...skins.map(skin => skin.id)) + 1
        : 1;

      const skin: Skin = {
        id: newId,
        name: body.name.trim(),
        weapon: body.weapon.trim(),
        rarity: body.rarity.trim(),
        condition: body.condition.trim(),
        price: Number(body.price),
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {})
      };

      skins.push(skin);
      saveSkins(skins);
      sendJson(res, 201, skin);
      return;
    }

    if (req.method === "PUT" && id !== null) {
      const body = await readBody(req);

      if (!validateSkin(body)) {
        sendJson(res, 400, { error: "Dados inválidos." });
        return;
      }

      const skins = readSkins();
      const index = skins.findIndex(skin => skin.id === id);

      if (index === -1) {
        sendJson(res, 404, { error: "Skin não encontrada." });
        return;
      }

      const updated: Skin = {
        id,
        name: body.name.trim(),
        weapon: body.weapon.trim(),
        rarity: body.rarity.trim(),
        condition: body.condition.trim(),
        price: Number(body.price),
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {})
      };

      skins[index] = updated;
      saveSkins(skins);
      sendJson(res, 200, updated);
      return;
    }

    if (req.method === "DELETE" && id !== null) {
      const skins = readSkins();
      const exists = skins.some(skin => skin.id === id);

      if (!exists) {
        sendJson(res, 404, { error: "Skin não encontrada." });
        return;
      }

      saveSkins(skins.filter(skin => skin.id !== id));
      sendJson(res, 200, { message: "Skin excluída com sucesso." });
      return;
    }

    sendJson(res, 404, { error: "Rota não encontrada." });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Erro interno do servidor." });
  }
});

const PORT = Number(process.env.PORT) || 3000;

server.listen(PORT, () => {
  console.log(`SkinVault API rodando em http://localhost:${PORT}`);
});
