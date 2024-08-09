import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max } from 'class-validator';

export class PaginationDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsOptional()
  public readonly page: number = 1;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsOptional()
  @Max(100)
  public readonly limit: number = 10;
}
