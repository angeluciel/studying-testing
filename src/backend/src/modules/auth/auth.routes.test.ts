import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from '@/app';
import { Auth } from '@/tests/helpers/auth';
import { Db } from '@/db/pool';
import { passwordChangeTokensTable, usersTable } from '@/db/schema';
import { generateRawToken, hashToken } from '@/utils/tokens';
import { verifyAccessToken } from '@/utils/jwt';
import { env } from '@/config/env';
import { sql, eq } from 'drizzle-orm';
import { sendMailWithTemplate } from '@/utils/mail';


vi.mock('../../utils/mail', () => ({
  sendMailWithTemplate: vi.fn(),
}));


const auth = new Auth(Db);

// ─── Helpers de banco para o fluxo de troca de senha ─────────────────────────

// Insere diretamente um token válido na tabela password_change_tokens.
// expires_at: sql`now() = interval '30 minutes'`  (= ao invés de +) (EXPLIQUE OREIA SECA)
// Isso tornaria o token gerado como expirado, nãow (jão). 
async function insertValidToken(userId: string): Promise<string> {
  const raw = generateRawToken();
  await Db.insert(passwordChangeTokensTable).values({
    user_id: userId,
    token_hash: hashToken(raw),
    expires_at: sql`now() + interval '30 minutes'`,
  });
  return raw;
}

async function insertExpiredToken(userId: string): Promise<string> {
  const raw = generateRawToken();
  await Db.insert(passwordChangeTokensTable).values({
    user_id: userId,
    token_hash: hashToken(raw),
    expires_at: sql`now() - interval '1 second'`,
  });
  return raw;
}

async function insertConsumedToken(userId: string): Promise<string> {
  const raw = generateRawToken();
  await Db.insert(passwordChangeTokensTable).values({
    user_id: userId,
    token_hash: hashToken(raw),
    expires_at: sql`now() + interval '30 minutes'`,
    used_at: sql`now()`,
  });
  return raw;
}

// POST /auth/login
// =============================================================================

describe('POST /auth/login', () => {

  it('returns 200 with accessToken when credentials are correct', async () => {
    // Cria um usuário no banco de testes com senha = env.TEMP_PASSWORD.
    const { user } = await auth.createUser('user');

    // Faz a requisição de login com as credenciais corretas.
    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: env.TEMP_PASSWORD });


    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('the accessToken encodes the correct user payload (sub, email, role)', async () => {
    const { user } = await auth.createUser('user');

    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: env.TEMP_PASSWORD });


    // verifyAccessToken lança erro se a assinatura for inválida.
    const payload = verifyAccessToken(res.body.accessToken);

    expect(payload.sub).toBe(user.id);
    expect(payload.email).toBe(user.email);
    expect(payload.role).toBe(user.role);
  });

  // ── Erros de autenticação ────────────────────────────────────────────────

  it('returns 401 when user does not exist', async () => {
    // Nenhum usuário com esse e-mail existe no banco; = 401.
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'fantasma@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials.' });
  });

  it('returns 401 when password is incorrect', async () => {
    const { user } = await auth.createUser('user');

    // Senha errada; o bcrypt retornará false → AppError 401.
    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: 'senhaerrada123' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials.' });
  });

  it('returns 401 when account is inactive', async () => {
    const { user } = await auth.createUser('user');

    // Desativa o usuário diretamente no banco, (me explicar direitinho),
    // para simular uma conta suspensa (dúvida para perguntar ao niggr).
    await Db.update(usersTable)
      .set({ is_active: false })
      .where(eq(usersTable.id, user.id));

    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: env.TEMP_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials.' });
  });

  // ── Validação de entrada 

  describe('input validation', () => {
    // it.each executa o mesmo bloco de teste para cada linha da tabela (o it.each executa o mesmo código com diferentes dados).
    // Muda o conteúdo do Body (Jão já havia falado).
    it.each([
      // e-mail ausente do body
      [{ password: 'password123' }, 'email', undefined],
      // e-mail em formato inválido
      [{ email: 'nao-e-email', password: 'password123' }, 'email', undefined],
      // senha ausente do body
      [{ email: 'test@test.com' }, 'password', undefined],
      // senha com menos de 8 caracteres — também confere a mensagem exata do schema
      [{ email: 'test@test.com', password: 'curta' }, 'password', 'Password too short.'],
    ] as const)(
      'returns 400 for invalid body (field: %s)',
      async (body, field, message) => {
        const res = await request(app).post('/auth/login').send(body);

        // O errorMiddleware = 400 para o Zod com message, issues.
        expect(res.status).toBe(400);
        // issues.fieldErrors é um objeto (validacao de campo individual em formulário) { [campo]: string[] }
        expect(res.body.issues.fieldErrors).toHaveProperty(field);

        // Quando uma mensagem específica é esperada, verifica o conteúdo de uma lista, de um array (explicar na prática).
        if (message) {
          expect(res.body.issues.fieldErrors[field]).toContain(message);
        }
      },
    );
  });
});

// POST /auth/request-password-change
// =============================================================================

describe('POST /auth/request-password-change', () => {

  it('returns 200 with the generic message when email exists', async () => {
    const { user } = await auth.createUser('user');

    const res = await request(app)
      .post('/auth/request-password-change')
      .send({ email: user.email });

    // Por quê retorna 200 mesmo com erro, tentei entender e não consegui (jão explique).
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'if the account exists, a password change email was sent',
    });
  });

  it('calls sendMailWithTemplate once with the correct recipient when email exists', async () => {
    const { user } = await auth.createUser('user');

    await request(app)
      .post('/auth/request-password-change')
      .send({ email: user.email });

    // vi.fn() registra todas as chamadas para verificar destinatário e assunto.
    expect(sendMailWithTemplate).toHaveBeenCalledTimes(1);
    expect(sendMailWithTemplate).toHaveBeenCalledWith(
      user.email,                // primeiro argumento: destinatário
      'Reset your password:',    // segundo argumento: assunto
      expect.anything(),         // terceiro argumento: elemento React (template)
    );
  });

  it('returns 200 with the same message when email does NOT exist (prevents enumeration)', async () => {
    // Nenhum usuário com esse e-mail existe; retorna nesse caso o que? (jão)
    // O controller sempre responde com a mesma mensagem para não revelar quais
    // e-mails estão cadastrados (proteção contra enumeração, tornando mensagens de erro genérica) .
    const res = await request(app)
      .post('/auth/request-password-change')
      .send({ email: 'inexistente@test.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'if the account exists, a password change email was sent',
    });
  });

  it('does NOT send an email when the account does not exist', async () => {
    await request(app)
      .post('/auth/request-password-change')
      .send({ email: 'inexistente@test.com' });

    // O que o service vai retornar (jão)
    // sendMailWithTemplate jamais deve ser chamado (deve ser evitatado, não é regra geral**).
    expect(sendMailWithTemplate).not.toHaveBeenCalled();
  });

  // ── Validação de entrada ─────────────────────────────────────────────────

  describe('input validation', () => {
    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/auth/request-password-change')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.issues.fieldErrors).toHaveProperty('email');
    });

    it('returns 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/auth/request-password-change')
        .send({ email: 'nao-e-email' });

      expect(res.status).toBe(400);
      expect(res.body.issues.fieldErrors).toHaveProperty('email');
    });
  });
});

// POST /auth/change-password
// =============================================================================

describe('POST /auth/change-password', () => {
  // Caminho do teste (não citei nos outros acima mas explicado pelo jão)

  it('returns 200 with success message when token is valid', async () => {
    const { user } = await auth.createUser('user');
    // insertValidToken insere um token com expires_at = now() + 30 min e retorna (jão explicou que é para aumentar segurança e tá ligado ao JWT)
    // o raw token (Token Bruto), (hex de 64 chars) que o cliente enviaria na requisição.
    const token = await insertValidToken(user.id);

    const res = await request(app)
      .post('/auth/change-password')
      .send({ token, newPassword: 'novasenha123' });

    // O controller responde { message } quando o serviço é executado sem erros.
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Password updates successfully' });
  });

  it('allows login with the new password after a successful change', async () => {
    const { user } = await auth.createUser('user');
    const token = await insertValidToken(user.id);
    const novasenha = 'novasenha123';

    // Troca a senha via endpoint. Ou seja, cria uma requisição HTTP apontando para a sua aplicação (entender na prática amanhã rodando teste)
    await request(app)
      .post('/auth/change-password')
      .send({ token, newPassword: novasenha });

    // Tenta logar com a nova senha; espera 200(sucesso niggr) com accessToken.
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: novasenha });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
  });

  it('old password no longer works after a successful change', async () => {
    const { user } = await auth.createUser('user');
    const token = await insertValidToken(user.id);

    await request(app)
      .post('/auth/change-password')
      .send({ token, newPassword: 'novasenha123' });

    // Tenta logar com a senha antiga; deve retornar 401 (unathorized niggr).
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: env.TEMP_PASSWORD });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body).toEqual({ message: 'Invalid credentials.' });
  });

  // ── Erros de token ───────────────────────────────────────────────────────

  it('returns 400 when the token does not exist in the database', async () => {
    // generateRawToken cria um hex (codificação hexadecimal) aleatório que nunca foi inserido no banco.
    const res = await request(app)
      .post('/auth/change-password')
      .send({ token: generateRawToken(), newPassword: 'novasenha123' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid or expired token' });
  });

  it('returns 400 when the token is expired', async () => {
    const { user } = await auth.createUser('user');
    // insertExpiredToken insere com expires_at = now() - 1 second (já vencido).
    const token = await insertExpiredToken(user.id);

    const res = await request(app)
      .post('/auth/change-password')
      .send({ token, newPassword: 'novasenha123' });

    // O repositório filtra por gt(expires_at, now()), então token expirado retorna null.
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid or expired token' });
  });

  it('returns 400 when the token has already been consumed', async () => {
    const { user } = await auth.createUser('user');
    // insertConsumedToken insere com used_at = now() (já consumido).
    const token = await insertConsumedToken(user.id);

    const res = await request(app)
      .post('/auth/change-password')
      .send({ token, newPassword: 'novasenha123' });

    // O repositório filtra por isNull(used_at), então token consumido retorna null.
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid or expired token' });
  });

  // CAMINHO DA FELICIDADE = Documenta o bug conhecido: o token nunca é marcado como consumido após uso.
  // auth.service.ts → changePassword() passa `tokenHash` como `tokenId`
  // mas auth.repository.ts → updatePwdAndConsumeTk() faz WHERE id = tokenId,
  // sendo .id do tipo UUID (JÃO EXPLICOU) — o hash nunca coincide, portanto used_at nunca é preenchido.
  it.todo(
    'BUG: token should be rejected on a second use — updatePwdAndConsumeTk receives tokenHash as tokenId, but the repository filters by .id (UUID), so used_at is never set and the token can be reused indefinitely',
  );

  // ── Validação de entrada ─────────────────────────────────────────────────

  describe('input validation', () => {
    it('returns 400 when token field is missing', async () => {
      // changePasswordSchema exige token: z.string().min(1)
      const res = await request(app)
        .post('/auth/change-password')
        .send({ newPassword: 'novasenha123' });

      expect(res.status).toBe(400);
      expect(res.body.issues.fieldErrors).toHaveProperty('token');
    });

    it('returns 400 when newPassword is missing', async () => {
      // changePasswordSchema exige newPassword: z.string().min(8)
      const res = await request(app)
        .post('/auth/change-password')
        .send({ token: 'qualquertoken' });

      expect(res.status).toBe(400);
      expect(res.body.issues.fieldErrors).toHaveProperty('newPassword');
    });

    it('returns 400 when newPassword is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/auth/change-password')
        .send({ token: 'qualquertoken', newPassword: 'curta' });

      expect(res.status).toBe(400);
      expect(res.body.issues.fieldErrors).toHaveProperty('newPassword');
    });
  });
});
