import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export abstract class BaseProductDto {
    @IsNotEmpty({ message: 'Name should not be empty' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @IsNumber()
    @Min(0)
    @Max(90000)
    @IsNotEmpty({ message: 'Price must be provided' })
    price: number;

    @IsString({ message: 'Description must be a string' })
    @MinLength(10)
    @MaxLength(200)
    @IsNotEmpty({ message: 'Description should not be empty' })
    description: string;
}