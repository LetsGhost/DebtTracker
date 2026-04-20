import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie, setAuthCookie } from "@/backend/common/auth";
import { connectDatabase } from "@/backend/common/db";
import { ApiError } from "@/backend/common/errors";
import { fail, ok } from "@/backend/common/response";
import { validateDto } from "@/backend/common/validation";
import { LoginDto, RegisterDto } from "@/backend/modules/auth/auth.dto";
import { AuthService } from "@/backend/modules/auth/auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(request: NextRequest) {
    try {
      await connectDatabase();
      const dto = await validateDto(RegisterDto, await request.json());
      const { user, token } = await this.authService.register(dto);
      const response = ok(user, 201);
      setAuthCookie(response, token);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.statusCode);
      }
      return fail("Internal server error", 500);
    }
  }

  async login(request: NextRequest) {
    try {
      await connectDatabase();
      const dto = await validateDto(LoginDto, await request.json());
      const { user, token } = await this.authService.login(dto);
      const response = ok(user);
      setAuthCookie(response, token);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.statusCode);
      }
      return fail("Internal server error", 500);
    }
  }

  async me() {
    try {
      await connectDatabase();
      const user = await this.authService.me();
      return ok(user);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.statusCode);
      }
      return fail("Internal server error", 500);
    }
  }

  logout() {
    const response = NextResponse.json({ success: true, data: { loggedOut: true } });
    clearAuthCookie(response);
    return response;
  }
}
