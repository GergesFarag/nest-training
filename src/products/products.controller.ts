import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JWTPayloadType } from '../utils/types';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@Controller('products') //Class Decorator
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get() //Method  -> Route Handler Decorator
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter products by name',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: String,
    description: 'Filter products by minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: String,
    description: 'Filter products by maximum price',
  })
  public getProducts(
    @Query('name') name?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.productsService.getProducts(name, minPrice, maxPrice);
  }

  @Get(':id')
  public getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard, AuthRolesGuard)
  @ApiSecurity('Bearer')
  public addProduct(
    @Body() product: CreateProductDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    //Make validation run in pipe layer
    return this.productsService.addProduct(payload.id, product);
  }

  //   @Post('express-based')
  //   public addProductExpressBased(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  //     const product: CreateProductDto = req.body;
  //     const result = this.productsService.addProduct(product);
  //     if (result) {
  //         res.status(201).json({ message: 'Product created successfully' });
  //     } else {
  //       res.status(400).json({ message: 'Failed to create product' });
  //     }
  //   }

  @Put(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('Bearer')
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() product: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, product);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('Bearer')
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
