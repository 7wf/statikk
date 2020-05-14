import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Project } from './project'

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
    @Column({ select: false })
    password!: string

    /**
     * The projects made by this user.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @OneToMany((type) => Project, (project) => project.owner)
    projects!: Project[]
}
