import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie, setAuthCookie } from "@/backend/common/auth/auth";
import { connectDatabase } from "@/backend/common/database/db";
import { ApiError } from "@/backend/common/errors/errors";
import { fail, ok } from "@/backend/common/http/response";
import { validateDto } from "@/backend/common/validation/validation";
import {
  LoginDto,
  RegisterDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "@/backend/modules/auth/auth.dto";
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
        return fail(error.message, error.statusCode, error);
      }
      return fail("Internal server error", 500, error);
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
        return fail(error.message, error.statusCode, error);
      }
      return fail("Internal server error", 500, error);
    }
  }

  async me() {
    try {
      await connectDatabase();
      const user = await this.authService.me();
      return ok(user);
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.statusCode, error);
      }
      return fail("Internal server error", 500, error);
    }
  }

  async requestPasswordReset(request: NextRequest) {
    try {
      await connectDatabase();
      const dto = await validateDto(RequestPasswordResetDto, await request.json());
      return ok(await this.authService.requestPasswordReset(dto));
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.statusCode, error);
      }
      return fail("Internal server error", 500, error);
    }
  }

  async resetPassword(request: NextRequest) {
    try {
      await connectDatabase();
      const dto = await validateDto(ResetPasswordDto, await request.json());
      return ok(await this.authService.resetPassword(dto));
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.statusCode, error);
      }
      return fail("Internal server error", 500, error);
    }
  }

  async verifyEmail(request: NextRequest) {
    try {
      await connectDatabase();
      const dto = await validateDto(VerifyEmailDto, await request.json());
      return ok(await this.authService.verifyEmail(dto));
    } catch (error) {
      if (error instanceof ApiError) {
        return fail(error.message, error.statusCode, error);
      }
      return fail("Internal server error", 500, error);
    }
  }

  logout() {
    const response = NextResponse.json({ success: true, data: { loggedOut: true } });
    clearAuthCookie(response);
    return response;
  }
}
