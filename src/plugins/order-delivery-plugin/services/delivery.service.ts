import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestContext, Order, Asset ,TransactionalConnection} from '@vendure/core';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthMiddleware } from '../../../middlewares/auth.middleware';
import { Repository } from 'typeorm';
import { RiderRequest } from '../entities/request.entity';
import { Rider } from '../../rider-plugin/entities/rider.entity';
import { CustomCustomer } from '../../customer-plugin/entities/customer.entity';
import { CustomSeller } from '../../seller-plugin/entities/seller.entity';
import {
  DeliveryDetails,
  DecisionResponse,
  LocationInput,
  OrderDetails,
  RiderDetails,
  foundResponse
} from '../types';

@Injectable()
export class DeliveryService {
  constructor(
    private connection: TransactionalConnection,
    private readonly authMiddleware: AuthMiddleware,
  ) {}

  async getDeliveryDetails(ctx: RequestContext, orderId: string): Promise<any> {

    const orderRepository = this.connection.getRepository(ctx, Order);
    const riderRequestRepository = this.connection.getRepository(ctx, RiderRequest);
    const customerRepository = this.connection.getRepository(ctx, CustomCustomer);

    const order = await orderRepository.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    const riderRequest = await riderRequestRepository.findOne({
      where: { order },
      relations: ['rider', 'order']
    });

    const customer = await customerRepository.findOne({
      where: { order }
    });

    const rider = riderRequest ? riderRequest.rider : null;
    const deliveryDetails = {
      id: order.id,
      orderId: order.id.toString(),
      pickUpAddress: order.shippingAddress.streetLine1,
      dropOffAddress: order.billingAddress.streetLine1,
      totalDistance: 0,
      payment: order.totalWithTax,
      estimatedTime: '',
      status: order.state,
      deliveryProof: null,
      customer: customer
        ? {
            id: customer.id,
            fullName: customer.fullName,
            phone: customer.phone,
            avatar: customer.avatar,
            status: order.state
          }
        : null,
      rider: rider
        ? {
            id: rider.id,
            fullName: rider.fullName,
            phone: rider.phone,
            avatar: { id: '1', url: rider.avatar },
            vehicle: rider.vehicleType,
            rating: rider.rating,
            distance: 0,
            eta: ''
          }
        : null,
      seller: {
        id: riderRequest?.seller.id,
        fullName: riderRequest?.seller.fullName,
        phone: riderRequest?.seller.phone,
        avatar: riderRequest?.seller.avatar,
        status: order.state
      }
    };

    return deliveryDetails;
  }

  async findRider(
    ctx: RequestContext,
    orderId: string,
    headers: Record<string, string | string[]>
  ): Promise<foundResponse> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    if (!decodedToken || !decodedToken.id) {
      console.error('Invalid or missing token');
    }
    const riderRepository = this.connection.getRepository(ctx, Rider);
    const riderRequestRepository = this.connection.getRepository(ctx, RiderRequest);
    const sellerRepository = this.connection.getRepository(ctx, CustomSeller);

    const sellerId = decodedToken.id;
    const orderRepository = this.connection.getRepository(ctx, Order);
    const order = await orderRepository.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const seller = await sellerRepository.findOne({
      where: { userId: sellerId }
    });

    if (!seller) {
      throw new NotFoundException(`seller with ID ${sellerId} not found`);
    }

    const sellerLocation = await this.getGeoLocation(seller.shopAddress);
    const availableRiders = await riderRepository.find({
      where: { online: true }
    });

    const nearestRider = this.findNearestRider(sellerLocation, availableRiders);
    if (!nearestRider) {
      throw new NotFoundException(`No available riders found`);
    }

    const riderRequest = new RiderRequest();
    riderRequest.rider = nearestRider;
    riderRequest.order = order;
    riderRequest.status = 'pending';

    await riderRequestRepository.save(riderRequest);
    // Notify rider about the request

    const riderDetails = {
      id: nearestRider.id,
      fullName: nearestRider.fullName,
      phone: nearestRider.phone,
      avatar: nearestRider.avatar,
      vehicle: nearestRider.vehicleType,
      rating: nearestRider.rating,
      distance: 10.2,
      eta: '2:00pm'
    };

    const response = {
      id: order.id,
      orderStatus: 'pending',
      rider: riderDetails
    }

    return {
      success: true,
      message: `Rider found . your rider is 5min away`,
      data:response
    };
  }

  async processRequest(
    ctx: RequestContext,
    requestId: string,
    decision: 'accept' | 'dismiss',
    headers: Record<string, string | string[]>
  ): Promise<DecisionResponse> {
    const decodedToken = this.authMiddleware.verifyToken(headers);
    if (!decodedToken || !decodedToken.id) {
      console.error('Invalid or missing token');
    }
    const riderRepository = this.connection.getRepository(ctx, Rider);
    const riderRequestRepository = this.connection.getRepository(ctx, RiderRequest);
    const riderId = decodedToken.id;
    const rider = await riderRepository.findOne({
      where: { userId: riderId }
    });

    if (!rider) {
      throw new NotFoundException(`rider with ID ${riderId} not found`);
    }
    const deliveryRequest = await riderRequestRepository.findOne({
      where: { id: requestId },
      relations: ['rider', 'order']
    });

    if (!deliveryRequest) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    if (decision === 'accept') {
      deliveryRequest.status = 'accepted';

      // Notify seller about the acceptance
    } else {
      deliveryRequest.status = 'dismissed';
      await this.findRider(ctx, deliveryRequest.order.id.toString(), headers);
    }

    await riderRequestRepository.save(deliveryRequest);
    return {
      success: true,
      message: `Request ${deliveryRequest.status}`
    };
  }

  async updateRiderLocation(
    ctx: RequestContext,
    riderId: string,
    location: LocationInput
  ): Promise<RiderDetails> {
    const riderRepository = this.connection.getRepository(ctx, Rider);
    const rider = await riderRepository.findOne({
      where: { id: riderId }
    });
    if (!rider) {
      throw new NotFoundException(`Rider with ID ${riderId} not found`);
    }

    rider.latitude = location.latitude;
    rider.longitude = location.longitude;

    await riderRepository.save(rider);

    const riderDetails = {
      id: rider.id,
      fullName: rider.fullName,
      phone: rider.phone,
      avatar: rider.avatar,
      vehicle: rider.vehicleType,
      rating: rider.rating,
      distance: 10.2,
      eta: 'string'
    };

    return riderDetails;
  }

  async submitDeliveryProof(ctx: RequestContext, file: any): Promise<Asset> {
    // Logic to handle file upload and save as Asset
    const asset = new Asset();
    // Save file as asset (implement file saving logic)
    return asset;
  }

  async updateOrderStatus(
    ctx: RequestContext,
    orderId: string,
    status: string
  ): Promise<OrderDetails> {

    const riderRequestRepository = this.connection.getRepository(ctx, RiderRequest);
    const orderRepository = this.connection.getRepository(ctx, Order);
    const order = await orderRepository.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const riderRequest = await riderRequestRepository.findOne({
      where: { order },
      relations: ['rider']
    });
    const rider = riderRequest ? riderRequest.rider : null;

    if (!rider) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const riderDetails = {
      id: rider.id,
      fullName: rider.fullName,
      phone: rider.phone,
      avatar: rider.avatar,
      vehicle: rider.vehicleType,
      rating: rider.rating,
      distance: 10.2,
      eta: 'string'
    };

    return {
      id: order.id,
      orderStatus: status,
      rider:riderDetails
    }
  }

  private async getGeoLocation(address: string): Promise<LocationInput> {
    // Logic to convert address to geolocation (latitude, longitude)
    return { latitude: 0, longitude: 0 }; // Dummy location
  }

  private findNearestRider(
    sellerLocation: LocationInput,
    riders: Rider[]
  ): Rider {
    // Logic to find the nearest rider based on seller location
    return riders[0]; // Dummy nearest rider
  }
}
