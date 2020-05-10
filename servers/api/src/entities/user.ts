import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class User extends BaseEntity {
    /**
     * The ID of the user.
     */
    @PrimaryGeneratedColumn()
    id!: number

    /**
     * The name of the user.
     */
    @Column()
    name!: string

    /**
     * The email of the user.
     */
    @Column()
    email!: string

    /**
     * The hashed password of the user.
     */
    @Column()
    password!: string
}
