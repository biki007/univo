'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  CubeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BeakerIcon,
  HomeIcon,
  MapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface MetaverseWorld {
  id: string;
  name: string;
  description: string;
  type: 'corporate' | 'educational' | 'social' | 'custom';
  capacity: number;
  currentUsers: number;
  thumbnail: string;
  features: string[];
  physics: boolean;
  economy: boolean;
  governance: boolean;
}

interface VirtualObject {
  id: string;
  name: string;
  type: 'furniture' | 'decoration' | 'interactive' | 'nft';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  properties: Record<string, any>;
}

interface EconomyTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'trade' | 'reward';
  amount: number;
  currency: string;
  item: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  votes: { for: number; against: number; abstain: number };
  status: 'active' | 'passed' | 'rejected' | 'executed';
  deadline: Date;
}

export default function MetaverseMeeting() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentWorld, setCurrentWorld] = useState<MetaverseWorld | null>(null);
  const [activeTab, setActiveTab] = useState<'worlds' | 'builder' | 'economy' | 'governance' | 'analytics'>('worlds');
  const [isLoading, setIsLoading] = useState(false);
  const [virtualObjects, setVirtualObjects] = useState<VirtualObject[]>([]);
  const [economyTransactions, setEconomyTransactions] = useState<EconomyTransaction[]>([]);
  const [governanceProposals, setGovernanceProposals] = useState<GovernanceProposal[]>([]);
  const [userBalance, setUserBalance] = useState({ tokens: 1250, nfts: 8 });
  const [worldStats, setWorldStats] = useState({
    totalVisitors: 15420,
    activeUsers: 342,
    totalTransactions: 8750,
    governanceParticipation: 68
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const metaverseWorlds: MetaverseWorld[] = [
    {
      id: 'corporate-hq',
      name: 'Corporate Headquarters',
      description: 'Professional meeting space with boardrooms and presentation areas',
      type: 'corporate',
      capacity: 100,
      currentUsers: 23,
      thumbnail: '/api/placeholder/300/200',
      features: ['Boardrooms', 'Presentation Theater', 'Networking Lounge', 'Private Offices'],
      physics: true,
      economy: true,
      governance: false
    },
    {
      id: 'university-campus',
      name: 'Virtual University',
      description: 'Educational environment with classrooms and laboratories',
      type: 'educational',
      capacity: 500,
      currentUsers: 156,
      thumbnail: '/api/placeholder/300/200',
      features: ['Lecture Halls', 'Science Labs', 'Library', 'Student Commons'],
      physics: true,
      economy: false,
      governance: true
    },
    {
      id: 'innovation-lab',
      name: 'Innovation Laboratory',
      description: 'Collaborative space for research and development',
      type: 'custom',
      capacity: 50,
      currentUsers: 12,
      thumbnail: '/api/placeholder/300/200',
      features: ['3D Modeling', 'Prototype Testing', 'Collaboration Tools', 'Data Visualization'],
      physics: true,
      economy: true,
      governance: true
    },
    {
      id: 'social-plaza',
      name: 'Community Plaza',
      description: 'Open social space for informal meetings and events',
      type: 'social',
      capacity: 200,
      currentUsers: 89,
      thumbnail: '/api/placeholder/300/200',
      features: ['Event Stage', 'Art Gallery', 'Game Areas', 'Cafes'],
      physics: true,
      economy: true,
      governance: true
    }
  ];

  useEffect(() => {
    // Initialize 3D canvas
    if (canvasRef.current && currentWorld) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Simple 3D world visualization
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${currentWorld.name} - 3D Environment`, canvas.width / 2, canvas.height / 2);
      }
    }
  }, [currentWorld]);

  const handleConnectToWorld = async (world: MetaverseWorld) => {
    setIsLoading(true);
    try {
      // Simulate connection to metaverse world
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentWorld(world);
      setIsConnected(true);
      
      // Load world data
      setVirtualObjects([
        {
          id: 'obj-1',
          name: 'Conference Table',
          type: 'furniture',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          properties: { material: 'wood', color: '#8B4513' }
        },
        {
          id: 'obj-2',
          name: 'Holographic Display',
          type: 'interactive',
          position: { x: 2, y: 1, z: 0 },
          rotation: { x: 0, y: 45, z: 0 },
          scale: { x: 1.5, y: 1.5, z: 0.1 },
          properties: { resolution: '4K', interactive: true }
        }
      ]);

      setEconomyTransactions([
        {
          id: 'tx-1',
          type: 'purchase',
          amount: 50,
          currency: 'UNI',
          item: 'Premium Avatar Skin',
          timestamp: new Date(),
          status: 'completed'
        },
        {
          id: 'tx-2',
          type: 'reward',
          amount: 25,
          currency: 'UNI',
          item: 'Meeting Participation',
          timestamp: new Date(Date.now() - 3600000),
          status: 'completed'
        }
      ]);

      setGovernanceProposals([
        {
          id: 'prop-1',
          title: 'Upgrade Physics Engine',
          description: 'Proposal to upgrade the world physics engine for better interactions',
          proposer: 'TechLead_Alice',
          votes: { for: 156, against: 23, abstain: 12 },
          status: 'active',
          deadline: new Date(Date.now() + 7 * 24 * 3600000)
        }
      ]);
    } catch (error) {
      console.error('Failed to connect to metaverse world:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCurrentWorld(null);
    setVirtualObjects([]);
  };

  const renderWorldsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {metaverseWorlds.map((world) => (
          <Card key={world.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{world.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{world.description}</p>
                </div>
                <Badge variant={world.type === 'corporate' ? 'default' : world.type === 'educational' ? 'secondary' : 'primary'}>
                  {world.type}
                </Badge>
              </div>

              <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-video">
                <div className="text-center">
                  <CubeIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-500">3D Preview</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{world.currentUsers}/{world.capacity}</span>
                </span>
                <div className="flex space-x-2">
                  {world.physics && <Badge variant="info" className="text-xs">Physics</Badge>}
                  {world.economy && <Badge variant="success" className="text-xs">Economy</Badge>}
                  {world.governance && <Badge variant="warning" className="text-xs">Governance</Badge>}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {world.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleConnectToWorld(world)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="w-4 h-4 mr-2" />
                    Enter World
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBuilderTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">World Builder</h3>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium">3D Environment</h4>
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full bg-blue-900 border border-gray-300 rounded-lg"
            />
            
            <div className="flex mt-4 space-x-2">
              <Button size="sm" variant="outline">
                <EyeIcon className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline">
                <CogIcon className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline">
                <PlayIcon className="w-4 h-4 mr-1" />
                Test
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium">Virtual Objects</h4>
            <div className="space-y-3 overflow-y-auto max-h-64">
              {virtualObjects.map((obj) => (
                <div key={obj.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{obj.name}</div>
                    <div className="text-xs text-gray-500">{obj.type}</div>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <CogIcon className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <EyeIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" variant="outline">
              <CubeIcon className="w-4 h-4 mr-2" />
              Add Object
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Physics Settings</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-2 text-sm font-medium">Gravity</label>
            <input
              type="range"
              min="0"
              max="20"
              defaultValue="9.8"
              className="w-full"
              aria-label="Gravity strength"
            />
            <span className="text-xs text-gray-500">9.8 m/s²</span>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Air Resistance</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.1"
              className="w-full"
              aria-label="Air resistance"
            />
            <span className="text-xs text-gray-500">0.1</span>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Collision Detection</label>
            <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" aria-label="Collision detection mode">
              <option>Precise</option>
              <option>Fast</option>
              <option>Disabled</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderEconomyTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{userBalance.tokens}</div>
              <div className="text-sm text-gray-600">UNI Tokens</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CubeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{userBalance.nfts}</div>
              <div className="text-sm text-gray-600">NFT Assets</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{worldStats.totalTransactions}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
        <div className="space-y-3">
          {economyTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'purchase' ? 'bg-red-100' :
                  transaction.type === 'sale' ? 'bg-green-100' :
                  transaction.type === 'reward' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <CurrencyDollarIcon className={`w-4 h-4 ${
                    transaction.type === 'purchase' ? 'text-red-600' :
                    transaction.type === 'sale' ? 'text-green-600' :
                    transaction.type === 'reward' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <div className="text-sm font-medium">{transaction.item}</div>
                  <div className="text-xs text-gray-500">
                    {transaction.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'purchase' ? '-' : '+'}{transaction.amount} {transaction.currency}
                </div>
                <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                  {transaction.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Marketplace</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { name: 'Premium Avatar', price: 100, type: 'Avatar' },
            { name: 'Custom Furniture Set', price: 250, type: 'Furniture' },
            { name: 'Interactive Whiteboard', price: 150, type: 'Tool' }
          ].map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center mb-3 bg-gray-100 rounded-lg aspect-square">
                <CubeIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-sm font-medium">{item.name}</div>
              <div className="mb-2 text-xs text-gray-500">{item.type}</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-green-600">{item.price} UNI</span>
                <Button size="sm">Buy</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderGovernanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Governance Overview</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="text-2xl font-bold">{worldStats.governanceParticipation}%</div>
            <div className="text-sm text-gray-600">Participation Rate</div>
            <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-600 rounded-full" 
                style={{ width: `${worldStats.governanceParticipation}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-gray-600">Active Proposals</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Active Proposals</h3>
        <div className="space-y-4">
          {governanceProposals.map((proposal) => (
            <div key={proposal.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{proposal.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{proposal.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Proposed by {proposal.proposer} • Ends {proposal.deadline.toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={proposal.status === 'active' ? 'default' : 'secondary'}>
                  {proposal.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>For: {proposal.votes.for}</span>
                  <span>Against: {proposal.votes.against}</span>
                  <span>Abstain: {proposal.votes.abstain}</span>
                </div>
                
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="flex h-2 overflow-hidden rounded-full">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(proposal.votes.against / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-gray-400" 
                      style={{ width: `${(proposal.votes.abstain / (proposal.votes.for + proposal.votes.against + proposal.votes.abstain)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {proposal.status === 'active' && (
                <div className="flex mt-4 space-x-2">
                  <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                    Vote For
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                    Vote Against
                  </Button>
                  <Button size="sm" variant="outline">
                    Abstain
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" variant="outline">
          <ShieldCheckIcon className="w-4 h-4 mr-2" />
          Create New Proposal
        </Button>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{worldStats.totalVisitors}</div>
              <div className="text-sm text-gray-600">Total Visitors</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GlobeAltIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{worldStats.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{worldStats.totalTransactions}</div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{worldStats.governanceParticipation}%</div>
              <div className="text-sm text-gray-600">Governance</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Usage Analytics</h3>
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-500">Analytics Chart</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Popular Worlds</h3>
          <div className="space-y-3">
            {metaverseWorlds.slice(0, 3).map((world, index) => (
              <div key={world.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{world.name}</div>
                    <div className="text-xs text-gray-500">{world.currentUsers} users</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{Math.round(world.currentUsers / world.capacity * 100)}%</div>
                  <div className="text-xs text-gray-500">capacity</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">World Types</h3>
          <div className="space-y-3">
            {[
              { type: 'Corporate', count: 45, icon: BuildingOfficeIcon },
              { type: 'Educational', count: 32, icon: AcademicCapIcon },
              { type: 'Social', count: 28, icon: UserGroupIcon },
              { type: 'Custom', count: 15, icon: BeakerIcon }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">{item.type}</span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  if (isConnected && currentWorld) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GlobeAltIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Connected to {currentWorld.name}</h2>
                <p className="text-sm text-gray-600">{currentWorld.currentUsers} users online</p>
              </div>
            </div>
            <Button onClick={handleDisconnect} variant="secondary">
              Disconnect
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-4">
            <button
              onClick={() => setActiveTab('worlds')}
              className={`p-3 rounded-lg text-left transition-colors ${
                activeTab === 'worlds' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <GlobeAltIcon className="w-5 h-5 mb-2" />
              <div className="text-sm font-medium">Worlds</div>
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`p-3 rounded-lg text-left transition-colors ${
                activeTab === 'builder' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <CubeIcon className="w-5 h-5 mb-2" />
              <div className="text-sm font-medium">Builder</div>
            </button>
            <button
              onClick={() => setActiveTab('economy')}
              className={`p-3 rounded-lg text-left transition-colors ${
                activeTab === 'economy' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <CurrencyDollarIcon className="w-5 h-5 mb-2" />
              <div className="text-sm font-medium">Economy</div>
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`p-3 rounded-lg text-left transition-colors ${
                activeTab === 'governance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <ShieldCheckIcon className="w-5 h-5 mb-2" />
              <div className="text-sm font-medium">Governance</div>
            </button>
          </div>
        </Card>

        {activeTab === 'worlds' && renderWorldsTab()}
        {activeTab === 'builder' && renderBuilderTab()}
        {activeTab === 'economy' && renderEconomyTab()}
        {activeTab === 'governance' && renderGovernanceTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CubeIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Metaverse Meeting Spaces</h2>
              <p className="text-gray-600">Enter immersive 3D virtual worlds for collaborative meetings</p>
            </div>
          </div>
          <Badge variant="info">Beta</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-5">
          <button
            onClick={() => setActiveTab('worlds')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === 'worlds' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <GlobeAltIcon className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Worlds</div>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === 'builder' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <CubeIcon className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Builder</div>
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === 'economy' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <CurrencyDollarIcon className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Economy</div>
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === 'governance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ShieldCheckIcon className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Governance</div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === 'analytics' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Analytics</div>
          </button>
        </div>
      </Card>

      {activeTab === 'worlds' && renderWorldsTab()}
      {activeTab === 'builder' && renderBuilderTab()}
      {activeTab === 'economy' && renderEconomyTab()}
      {activeTab === 'governance' && renderGovernanceTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
}
              