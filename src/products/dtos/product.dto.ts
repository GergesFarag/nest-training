import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export abstract class BaseProductDto {
    @IsNotEmpty({ message: 'Name should not be empty' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty()
    name: string;

    @IsNumber()
    @Min(0)
    @Max(90000)
    @ApiProperty()
    @IsNotEmpty({ message: 'Price must be provided' })
    price: number;

    @IsString({ message: 'Description must be a string' })
    @MinLength(10)
    @MaxLength(200)
    @ApiProperty()
    @IsNotEmpty({ message: 'Description should not be empty' })
    description: string;
}
