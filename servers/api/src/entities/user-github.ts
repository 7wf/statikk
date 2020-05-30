import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm'

@Entity()
export class GitHubUser extends BaseEntity {
    /**
     * The ID of the user that owns this token.
     */
    @PrimaryColumn()
    id!: number

    /**
     * The token of the user.
     */
    @Column()
    token!: string
}
