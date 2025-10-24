import { Module } from '@nestjs/common';
import { GraphTestService } from './graph-test.service';
import { GraphTestResolver } from './graph-test.resolver';

@Module({
  providers: [GraphTestResolver, GraphTestService],
})
export class GraphTestModule {}
