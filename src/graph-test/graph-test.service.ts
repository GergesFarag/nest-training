import { Injectable } from '@nestjs/common';
const db:{id:number , title:string , price:number }[]= [
  {id:1 , title:"Test Graph 1" , price:100},
  {id:2 , title:"Test Graph 2" , price:200},
  {id:3 , title:"Test Graph 3" , price:300},
  {id:4 , title:"Test Graph 4" , price:400},
  {id:5 , title:"Test Graph 5" , price:500},
]
@Injectable()
export class GraphTestService {

  findAll() {
    return {
      message: "Products retrieved successfully",
      state: true,
      data: db
    };
  }

}
