import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { Review } from 'src/reviews/review.entity';
import { User } from 'src/users/user.entity';
@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({
    type: 'float',
  })
  price: number;
  @Column({
    type: 'varchar',
    length: 150,
  })
  description: string;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    precision: 6,
  })
  createdAt: Date;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    precision: 6,
  })
  updatedAt: Date;
  @OneToMany(() => Review, (review) => review.product, { eager: true })
  reviews: Review[];

  @ManyToOne(() => User, (user) => user.products, { eager: true })
  user: User;
}
