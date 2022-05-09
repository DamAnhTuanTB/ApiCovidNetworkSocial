import { Post, Post as PostEntity } from '../../typeorm/post.entity';
import { User as UserEntity } from '../../typeorm/user.entity';
import { CommentPost as CommentPostEntity } from '../../typeorm/comment_posts.entity';
import { LikePost as LikePostEntity } from '../../typeorm/like_posts.entity';
import { LikeComment as LikeCommentEntity } from '../../typeorm/like_comments.entity';
import { SavePost as SavePostEntity } from '../../typeorm/save_posts.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommentPostEntity)
    private readonly commentPostRepository: Repository<CommentPostEntity>,
    @InjectRepository(LikePostEntity)
    private readonly likePostRepository: Repository<LikePostEntity>,
    @InjectRepository(SavePostEntity)
    private readonly savePostRepository: Repository<SavePostEntity>,
    @InjectRepository(LikeCommentEntity)
    private readonly likeCommentRepository: Repository<LikeCommentEntity>,
  ) {}
}
