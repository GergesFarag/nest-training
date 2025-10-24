import { Resolver, Query } from '@nestjs/graphql';
import { GraphTestService } from './graph-test.service';
import {  ProductsGraph } from './entities/graph-test.entity';
import { GetProductsResponseType } from './types/get-products-response.type';

@Resolver(() => ProductsGraph)
export class GraphTestResolver {
  constructor(private readonly graphTestService: GraphTestService) {}

   @Query(() => GetProductsResponseType)
   getProducts() {
    return this.graphTestService.findAll();
   }
   
}
