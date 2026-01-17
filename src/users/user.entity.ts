import { Product } from '../products/product.entity';
import { Review } from '../reviews/review.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserType } from '../utils/enums';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'varchar',
  })
  username: string;
  @Column({
    type: 'varchar',
    unique: true,
  })
  email: string;

  @Exclude()
  @Column({
    type: 'varchar',
  })
  password: string;

  @Column({
    default: false,
  })
  isVerified: boolean;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  verificationToken: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  resetPasswordToken: string | null;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.DEFAULT,
  })
  role: UserType;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  profileImage: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 6,
  })
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 6,
  })
  updatedAt: Date;
}
