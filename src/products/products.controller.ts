import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { UserType } from 'src/utils/enums';

@Controller('products') //Class Decorator
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get() //Method  -> Route Handler Decorator
  public getProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  public getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard,AuthRolesGuard)
  public addProduct(
    @Body() product: CreateProductDto,
    @CurrentUser() payload:JWTPayloadType
  ) {
    //Make validation run in pipe layer
    return this.productsService.addProduct( payload.id, product);
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
  public updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() product: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, product);
  }

  @Delete(':id')
  public deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
